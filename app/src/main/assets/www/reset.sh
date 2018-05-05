#! /bin/bash
clear
echo "----- reset Folders and Files -----"

for folders in "node_modules"
do
  if [ -d "$folders" ]; then
      rm -r $folders
      echo $folders" folders deleted"
  else
      echo $folders" folders not found"
  fi
done

for file in "package-lock.json"
do
  if [ -f "$file" ]; then
      rm -r $file
      echo $file" file deleted"
  else
      echo $file" file not found"
  fi
done

echo "npm install"
npm install
