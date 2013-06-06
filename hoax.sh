#!/bin/sh

[ -z "$HOAX_HOME" ] && export HOAX_HOME="/usr/local/hoax"

function bad_install() {
cat << EOF

It looks like something went wrong in the installation process.
Did you remember to export the install location of Hoax from your ~/.bashrc?

EOF
}

if [ ! -d "$HOAX_HOME" ];
then
    bad_install
    exit 1
fi

${HOAX_HOME}/bin/python ${HOAX_HOME}/hoax/dispatch.py $@
