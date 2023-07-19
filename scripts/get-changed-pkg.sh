#!/bin/bash

# 获取所有发生变更的文件列表
changed_files=$(git diff --name-only)

# 打印发生变更的文件列表
# echo "发生变更的文件列表："
# echo "$changed_files"

# 筛选出包含 package.json 文件的路径，并提取包名
changed_packages=$(echo "$changed_files" | grep -oE "^packages/[^/]+" | awk -F '/' '{print $2}' | sort -u)

# 打印包名列表
echo "发生内容更新的包名列表："
echo "$changed_packages"
