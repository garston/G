#!/bin/bash

MINUSES='--------------------------------------'
PLUSES='++++++++++++++++++++++++++++++++++++++'
SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )"
BUNDLE_FILE=$SCRIPT_DIR/bundle.txt

if [ "$#" -eq 0 ]; then
    while IFS= read -r line; do
        # 1. Check for the start marker
        if [[ "$line" == *"${PLUSES} "* ]]; then
            # Extract filename by removing the prefix and suffix markers
            filename="${line#*${PLUSES} }"
            filename="${filename% ${PLUSES}}"

            # Clear the file (or create it) and enable writing
            echo "Writing $filename"
            > "$filename"
            writing=true
            continue

        # 2. Check for the end marker
        elif [[ "$line" == *"${MINUSES} "* ]]; then
            writing=false
            continue
        fi

        # 3. If writing is enabled, append the line to the file
        if [ "$writing" = true ]; then
            echo "$line" >> "$filename"
        fi
    done < "$BUNDLE_FILE"
else
    cat $SCRIPT_DIR/../../DefinitelyTyped/types/google-apps-script/*.d.ts > $BUNDLE_FILE
    sed -i '' -e '/^\/\//d' -e '/^declare var MimeType/d' $BUNDLE_FILE

    echo "//`git rev-parse HEAD`" >> $BUNDLE_FILE

    for projectName in "$@"
    do
        echo "Building $projectName"
        for file in $projectName/*.js; do
            {
                echo "//$PLUSES $file $PLUSES"
                cat "$file"
                echo "//$MINUSES $file $MINUSES"
            }
        done >> $BUNDLE_FILE
    done

    open $BUNDLE_FILE
fi
