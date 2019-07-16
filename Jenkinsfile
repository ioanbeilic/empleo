@Library("devops-pipeline-library") _
if (env.RELEASE == 'true') {
  releasePipeline {}
} else {
  k8sNodePipeline {}
}
