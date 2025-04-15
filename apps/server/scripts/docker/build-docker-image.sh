#!/bin/bash

# Constants
SCRIPT_DIR=$(dirname "$(readlink -f "$0")")
LOG_FILE=${SCRIPT_DIR}/build-image.log
PROJECT_ROOT="${SCRIPT_DIR}/../../../../"
APP_PATH="./apps/server"

# Default values
ENV_FILE="./.env.production"
IMAGE_NAME="tk-crawler-server"
BUILD_ONLY=false
NO_CACHE=false

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Help message
function show_help() {
  cat <<EOF
Usage: $(basename "$0") [OPTIONS]

Options:
  -e FILE     Specify environment file (default: .env.production)
  -i NAME     Specify image name (default: tk-crawler-server)
  -b          Build only, don't run container
  -n          Build without cache
  -v VERSION  Override version number
  -h          Show this help message

Example:
  $(basename "$0") -e .env.staging -i my-server -b
EOF
}

# 处理参数
while getopts "e:i:v:bnh" opt; do
  case $opt in
  e) ENV_FILE=$OPTARG ;;
  i) IMAGE_NAME=$OPTARG ;;
  v) OVERRIDE_VERSION=$OPTARG ;;
  b) BUILD_ONLY=true ;;
  n) NO_CACHE=true ;;
  h)
    show_help
    exit 0
    ;;
  \?)
    echo -e "${RED}Invalid option: -$OPTARG${NC}" >&2
    exit 1
    ;;
  esac
done

# Change to project root
cd "${PROJECT_ROOT}" || {
  echo "Failed to change to project root"
  exit 1
}

# Initialize log file
: >"${LOG_FILE}"

function log() {
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo -e "${GREEN}[${timestamp}] $1${NC}" | tee -a ${LOG_FILE}
}

function log_warn() {
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo -e "${YELLOW}[${timestamp}] Warning: $1${NC}" | tee -a ${LOG_FILE}
}

function log_error() {
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo -e "${RED}[${timestamp}] Error: $1${NC}" | tee -a "${LOG_FILE}" >&2
}

function check_dependencies() {
  local deps=("docker" "node")
  for dep in "${deps[@]}"; do
    if ! command -v "$dep" &>/dev/null; then
      log_error "$dep is required but not installed."
      exit 1
    fi
  done
}

function load_port_from_env_file() {
  local PORT_VAR_NAME="SERVER_PORT"

  if [ ! -f "$ENV_FILE" ]; then
    log_error "$ENV_FILE file not found"
    exit 1
  fi

  PORT=$(grep -E "^[[:space:]]*$PORT_VAR_NAME[[:space:]]*=" "$ENV_FILE" | sed -E "s/^[[:space:]]*$PORT_VAR_NAME[[:space:]]*=[[:space:]]*[\"']?([^\"']+)[\"']?[[:space:]]*$/\1/" | tr -d '\n\r')

  if [ -z "$PORT" ]; then
    log_error "$PORT_VAR_NAME not found in $ENV_FILE"
    exit 1
  fi
}

function get_version() {
  if [ -n "$OVERRIDE_VERSION" ]; then
    VERSION=$OVERRIDE_VERSION
  else
    VERSION=$(node -p "require('${APP_PATH}/package.json').version")
  fi
  IMAGE_TAG="${IMAGE_NAME}:${VERSION}"
  log "Building version: ${VERSION}"
}

function remove_image() {
  if docker image inspect "${IMAGE_TAG}" >/dev/null 2>&1; then
    log "Removing existing image ${IMAGE_TAG}"
    docker rmi "${IMAGE_TAG}" >/dev/null 2>&1
  fi
}

function build_image() {
  log "Building docker image ${IMAGE_TAG}"
  local build_cmd="docker build . -f "${SCRIPT_DIR}/Dockerfile" --platform linux/amd64 -t "${IMAGE_TAG}""

  if [ "$NO_CACHE" = true ]; then
    build_cmd+=" --no-cache"
  fi

  build_cmd+=" --build-arg ENV_FILE="${ENV_FILE}" --build-arg PORT="${PORT}""

  if eval "$build_cmd" >>${LOG_FILE} 2>&1; then
    log "Docker image '${IMAGE_TAG}' built successfully."
  else
    log_error "Build failed, Check ${LOG_FILE} for more details"
    exit 1
  fi
}

function stop_and_remove_container() {
  if docker ps -a | grep -q ${IMAGE_NAME}; then
    log "Stopping and removing existing container"
    docker stop ${IMAGE_NAME} >/dev/null 2>&1
    docker rm ${IMAGE_NAME} >/dev/null 2>&1
  fi
}

function run_container() {
  log "Running new container"
  local command="docker run -d -p ${PORT}:${PORT} --name ${IMAGE_NAME} ${IMAGE_TAG}"
  log "Command: ${command}"

  if ${command} >>${LOG_FILE} 2>&1; then
    log "Container started successfully"

    # Wait for container to be healthy
    local max_attempts=30
    local attempt=1
    while [ $attempt -le $max_attempts ]; do
      if curl -s "http://localhost:${PORT}/health" >/dev/null; then
        log "Service is healthy"
        break
      fi
      log_warn "Waiting for service to be healthy (${attempt}/${max_attempts})"
      sleep 1
      ((attempt++))
    done

    if [ $attempt -gt $max_attempts ]; then
      log_error "Service failed to become healthy"
      exit 1
    fi

    log "To see container logs, use: docker logs ${IMAGE_NAME}"
  else
    log_error "Failed to start the container. Check ${LOG_FILE} for details."
    exit 1
  fi
}

function main() {
  log "Starting build process..."

  check_dependencies
  load_port_from_env_file
  get_version

  log "Environment file: $ENV_FILE"
  log "Image name: $IMAGE_NAME"
  log "Port: $PORT"

  remove_image
  build_image

  if [ "$BUILD_ONLY" = false ]; then
    stop_and_remove_container
    run_container
  else
    log "Build-only mode, skipping container deployment"
  fi

  log "All tasks completed successfully. See ${LOG_FILE} for details."
}

main "$@"
