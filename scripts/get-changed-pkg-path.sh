#!/bin/bash

# 获取所有发生变更的文件列表
changed_files=$(git diff --cached --name-only)


# 初始化变量用于存储包路径字符串
tag_name="v-"
package_paths=""

# 遍历发生变更的文件列表
for file in $changed_files; do

  # 提取文件所在目录路径
  directory=$(dirname "$file")
  
  # 检查目录路径是否包含 packages 关键字
  if [[ $directory == *"packages"* ]]; then
    name=$(basename "$directory")
    tag_name="$tag_name$name-"

    # 拼接 package.json 的路径，并添加到 package_paths 变量中
    package_paths="$package_paths$directory/package.json "
  fi
done

# 打印发生内容更新的包的package.json的路径字符串
echo "发生内容更新的包的package.json的路径：\n$package_paths"
echo "发生内容更新的包的版本：\n$tag_name"

filename="cache-changed-pkg-path.sh"

if [ ! -f "$filename" ]; then
    touch "$filename"

    echo "File created successfully."
fi

echo "bumpp $package_paths -t $tag_name" > $filename
