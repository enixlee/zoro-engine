 #!/bin/bash

echo "git commit"
git add .
git commit -m $1
git push
echo "git commit complete"
