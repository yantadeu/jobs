import java.text.SimpleDateFormat

DATETIME = (new SimpleDateFormat("yyyy-MM-dd HH:mm:ss")).format(new Date())

PROJECT_NAME = "jobs"

SONAR_PROJECT_NAME = "projetas/jobs"
SONAR_PROJECT_KEY = "projetas:jobs"

PROJECT_ENV = "DEVELOPMENT"
PROJECT_VERSION = "${env.BRANCH_NAME}-${BUILD_ID}"

node {
    checkout()
    checkPreconditions()
    setup()
    codeAnalysis()
    codeQuality()
}

def checkout() {
    stage("Checkout") {
        checkout(scm)
    }
}

def checkPreconditions() {
    stage("Check preconditions") {
        try {
            sh("sudo chmod 7777 /var/run/docker.sock")
            sh("sudo mkdir -p ${env.MVN_CACHE} && sudo chown -R $USER ${env.MVN_CACHE}")
        } catch(e) {}
    }
}

def setup() {
    stage("Setup") {
    }
}

def codeAnalysis() {
    stage("Code analysis") {
        withSonarQubeEnv {
            def dockerImage = docker.image("swids/sonar-scanner:2.8")
            dockerImage.inside() {
                sh("/sonar-scanner/sonar-scanner-2.8/bin/sonar-scanner " +
                    "-Dsonar.login=${env.SONAR_CREDENTIALS} " +
                    "-Dsonar.host.url=https://sonar.projetas.com.br/ " +
                    "-Dsonar.projectKey=${SONAR_PROJECT_KEY} " +
                    "-Dsonar.projectName=${SONAR_PROJECT_NAME} " +
                    "-Dsonar.projectVersion=${PROJECT_VERSION} " +
                    "-Dsonar.branch=${env.BRANCH_NAME} " +
                    "-Dsonar.sources=. " +
                    "-Dsonar.sourceEncoding=UTF-8 " +
                    "-Dsonar.tests=. " +
                    "-Dsonar.test.inclusions=**/*Test*/** " +
                    "-Dsonar.exclusions=**/*Test*/**")
            } 
        }
    }
}

def codeQuality() {
    stage("Code quality") {
        timeout(time: 1, unit: "HOURS") {
            def qg = waitForQualityGate() 
            if (qg.status != "OK") {
                error("Pipeline aborted due to quality gate failure: ${qg.status}")
            } 
        }
    }
}
