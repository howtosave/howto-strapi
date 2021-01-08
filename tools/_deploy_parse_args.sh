
# ///////////////////////////////////////////////////////////////////
#
# parse arguments and set the following variables
#
# BUILD_UI, PUSH_ONLY, DEPLOY_ENV, TARGET_USER, TARGET_SERVER
#
function show_help() {
echo '# Usage'
echo './deploy.sh -[b|p] [-e prod|dev] <target_server>'
echo ''
echo '   -b               build admin ui'
echo '   -p               push only without deployment'
echo '   -e               env for deployment. *prod|dev'
echo '   <target_server>  target server. such as: '
echo '                    svc00@127.0.0.1'
echo '   -h               show help and exit'
echo ''
}

_optstring='h?bpe:'

# build-ui
BUILD_UI="FALSE" # "" | "build-ui"

# push only
PUSH_ONLY="FALSE"

# deployment env
DEPLOY_ENV="prod"

function parse_dest_address() {
  local dest="$1"
  local arr_=(${dest//@/ })
  TARGET_USER=${arr_[0]}
  TARGET_SERVER=${arr_[1]}
}

function parse_options() {
  # A POSIX variable
  OPTIND=1         # Reset in case getopts has been used previously in the shell.
  while getopts "$_optstring" opt; do
      case "$opt" in
      h|\?)
          show_help
          exit 0
          ;;
      b)  BUILD_UI="build-ui"
          ;;
      p)  PUSH_ONLY="TRUE"
          ;;
      e)  DEPLOY_ENV=$OPTARG
          ;;
      esac
  done

  return $((OPTIND-1))
}

parse_options $@
shift $?
#echo "Leftovers: $@"

# STAGE server
# set TARGET_SERVER, TARGET_USER
parse_dest_address ${1:-"dev00@localhost"}
shift

parse_options $@ # to parse options appended after target_address

if [ ${DEPLOY_ENV} == "prod" ]; then
  DEPLOY_ENV="production"
else
  DEPLOY_ENV="development"
fi
