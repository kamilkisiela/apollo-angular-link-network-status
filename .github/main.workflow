workflow "Build and Size Check" {
  on = "push"
  resolves = "Size"
}

action "Install" {
  uses = "actions/npm@master"
  runs = "yarn"
  args = "install"
}

action "Build" {
  needs = "Install"
  uses = "actions/npm@master"
  runs = "yarn"
  args = "build"
}

action "Size" {
  needs = "Build"
  uses = "kamilkisiela/size-limit@master"
}
