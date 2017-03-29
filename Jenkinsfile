node {
  withEnv(["PATH+NODE=${tool name: 'node7', type: 'jenkins.plugins.nodejs.tools.NodeJSInstallation'}/bin"]) {
    sh 'node -v'
    sh 'npm -v'

    stage('Installing Dependencies') {
        sh 'git clone https://github.com/unicef/ibm-weather-crawler.git .'
        sh 'npm install'
    }

    stage('fetching&uploading') {
        sh 'node app.js'
    }
  }
}
