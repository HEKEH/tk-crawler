@echo off
echo 开始清理 node_modules 目录...

:: 使用 PowerShell 查找并删除所有 node_modules 目录
powershell -Command "Get-ChildItem -Path . -Filter node_modules -Directory -Recurse | Remove-Item -Force -Recurse"

:: 检查是否成功
if %ERRORLEVEL% EQU 0 (
    echo 所有 node_modules 目录已成功清理！
) else (
    echo 清理过程中出现错误，请检查权限或手动删除。
)

pause