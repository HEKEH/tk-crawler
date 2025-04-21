#!/bin/bash

# Constants
SCRIPT_DIR=$(dirname "$(readlink -f "$0")")
LOG_FILE=${SCRIPT_DIR}/build-image.log
PROJECT_ROOT="${SCRIPT_DIR}/../../../../"
APP_PATH="./apps/main-web"

# Default values
IMAGE_NAME="tk-crawler-main-web"
BUILD_ONLY=false
NO_CACHE=false
PORT=5001

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
  -i NAME     Specify image name (default: tk-crawler-main-web)
  -p PORT     Specify port (default: 5001)
  -b          Build only, don't run container
  -n          Build without cache
  -v VERSION  Override version number
  -h          Show this help message

Example:
  $(basename "$0") -i my-web -p 5001 -b
EOF
}

# 处理参数
while getopts "i:p:v:bnh" opt; do
  case $opt in
  i) IMAGE_NAME=$OPTARG ;;
  p) PORT=$OPTARG ;;
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
  local command="docker run -d -p ${PORT}:8080 --name ${IMAGE_NAME} ${IMAGE_TAG}"
  log "Command: ${command}"

  if ${command} >>${LOG_FILE} 2>&1; then
    log "Container started successfully"

    # Wait for container to be healthy
    local max_attempts=30
    local attempt=1
    while [ $attempt -le $max_attempts ]; do
      if curl -s "http://localhost:${PORT}" >/dev/null; then
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

function generate_docker_compose_file() {
  local docker_compose_file="${SCRIPT_DIR}/docker-compose.yml"
  local template_file="${SCRIPT_DIR}/docker-compose.template.yml"

  # Check template exists
  if [ ! -f "$template_file" ]; then
    log_error "Template file not found: $template_file"
    exit 1
  fi

  # Validate required variables
  if [ -z "$VERSION" ] || [ -z "$PORT" ] || [ -z "$IMAGE_NAME" ]; then
    log_error "Required variables VERSION or PORT or IMAGE_NAME not set"
    exit 1
  fi

  # Generate new file using envsubst
  IMAGE_NAME=$IMAGE_NAME \
    PORT=$PORT \
    VERSION=$VERSION \
    envsubst '${IMAGE_NAME} ${PORT} ${VERSION}' <"$template_file" >"$docker_compose_file"

  if [ $? -eq 0 ] && [ -s "$docker_compose_file" ]; then
    log "Docker compose file generated: ${docker_compose_file}"
  else
    log_error "Failed to generate docker-compose file"
    exit 1
  fi
}

function main() {
  log "Starting build process..."

  check_dependencies
  get_version

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

  generate_docker_compose_file

  log "All tasks completed successfully. See ${LOG_FILE} for details."
}

main "$@"
