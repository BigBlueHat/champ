#!/bin/sh

# This script will install Hoax to /usr/local only.
# To install elsewhere, change the value of HOAX_PREFIX.
HOAX_PREFIX=/usr/local
HOAX=${HOAX_PREFIX}/hoax

# Check that python is installed.
type python > /dev/null 2>&1 || {
    echo >&2 "Hoax requires that Python is installed. Aborting.";
    exit 1;
}

# Check that git is installed.
type git > /dev/null 2>&1 || { 
    echo >&2 "Hoax installation requires that git is installed. Aborting.";
    exit 1;
}

# Print an error message and exit the program on errors.
function trap_handler() {
LINE="$1"
cat << EOF

Uh-oh! Error installing Hoax on line ${LINE}.
Please report this to http://github.com/nick-thompson/hoax/issues.

EOF
exit $2
}

# Attach the trap handler
trap 'trap_handler ${LINENO}' ERR

# Begin installation.
# Download the Hoax repository.
echo "Downloading Hoax...";
git clone git://github.com/nick-thompson/hoax.git ${HOAX}

# Install the Hoax virtual environment.
echo "Downloading virtualenv standalone..."
curl -O https://pypi.python.org/packages/source/v/virtualenv/virtualenv-1.9.1.tar.gz
tar xzf virtualenv-1.9.1.tar.gz
echo "Creating the Hoax virtual environment..."
python virtualenv-1.9.1/virtualenv.py ${HOAX}
echo "Installing dependencies..."
${HOAX}/bin/pip install -r ${HOAX}/requirements.txt

# Link the runtime script
echo "Linking Hoax binary..."
[[ -L /usr/local/bin/hoax ]] && unlink /usr/local/bin/hoax
ln -s ${HOAX}/hoax.sh /usr/local/bin/hoax

# Print installation summary
cat << EOF

Finished installation to ${HOAX}.

*Note: If you have modified the installation PREFIX, please add the following
line to the end of your ~/.bashrc to finish installation:
export HOAX_HOME=${KAHUNA}

Now you are ready to run 'hoax'. Try 'hoax -h' for help information.

Have fun!

EOF
