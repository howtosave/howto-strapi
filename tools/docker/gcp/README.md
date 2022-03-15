# Google Cloud Platform

## GKE(Kubernetes cluster)

```sh
GC_PROJECT_ID="my-gc-project"
CLUSTER_PROJECT_NAME="first-cluster"
MACHINE_TYPE="e2-medium"
DISK_SIZE=32 # 32 GB
NETWORK="projects/carbon-101/global/networks/default"
SUB_NETWORK="projects/carbon-101/regions/asia-northeast3/subnetworks/default"

# create Kubernete cluster
gcloud beta container \
--project "$GC_PROJECT_ID" clusters create "$CLUSTER_PROJECT_NAME" \
--zone "asia-northeast3-c" --no-enable-basic-auth \
--cluster-version "1.18.12-gke.1200" --release-channel "rapid" \
--machine-type "$MACHINE_TYPE" --image-type "COS_CONTAINERD" --disk-type "pd-standard" --disk-size "$DISK_SIZE" \
--metadata disable-legacy-endpoints=true --scopes "https://www.googleapis.com/auth/devstorage.read_only","https://www.googleapis.com/auth/logging.write","https://www.googleapis.com/auth/monitoring","https://www.googleapis.com/auth/servicecontrol","https://www.googleapis.com/auth/service.management.readonly","https://www.googleapis.com/auth/trace.append" \
--num-nodes "3" --enable-stackdriver-kubernetes \
--enable-ip-alias --network "$NETWORK" --subnetwork "$SUB_NETWORK" \
--default-max-pods-per-node "110" --no-enable-master-authorized-networks \
--addons HorizontalPodAutoscaling,HttpLoadBalancing --enable-autoupgrade \
--enable-autorepair --max-surge-upgrade 1 --max-unavailable-upgrade 0 \
--enable-shielded-nodes

gcloud beta container --project "carbon-101" clusters create "first-cluster" --zone "asia-northeast3-c" --no-enable-basic-auth 

--machine-type "e2-medium" --image-type "COS_CONTAINERD" --disk-type "pd-standard" --disk-size "50" 
--metadata disable-legacy-endpoints=true --scopes "https://www.googleapis.com/auth/devstorage.read_only","https://www.googleapis.com/auth/logging.write","https://www.googleapis.com/auth/monitoring","https://www.googleapis.com/auth/servicecontrol","https://www.googleapis.com/auth/service.management.readonly","https://www.googleapis.com/auth/trace.append" --num-nodes "3" --enable-stackdriver-kubernetes 
--enable-ip-alias --network "projects/carbon-101/global/networks/default" --subnetwork "projects/carbon-101/regions/asia-northeast3/subnetworks/default" --default-max-pods-per-node "110" --no-enable-master-authorized-networks --addons HorizontalPodAutoscaling,HttpLoadBalancing,GcePersistentDiskCsiDriver --enable-autoupgrade --enable-autorepair --max-surge-upgrade 1 --max-unavailable-upgrade 0 --enable-shielded-nodes

```