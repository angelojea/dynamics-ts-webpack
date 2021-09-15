# dynamics-ts-webpack

<div align="center">
    <img src="https://raw.githubusercontent.com/angelojea/dynamics-ts-webpack/main/logo.png" style="max-width: 100%;width: 150px;">
</div>

## Prerequisites

* Visual Studio Code (<a href="https://code.visualstudio.com/">here</a>)</li>
* Git (<a href="https://git-scm.com/download/win/">here</a>)</li>
* Nodejs v10 or later (<a href="https://nodejs.org/en/download/">here</a>)</li>

## Installation

Open your preferred console application then navigate to the folder where you want to clone the git repo (replace <b>#local-git-repo-directory#</b> by local directory in your PC

```sh
cd #local-git-repo-directory#
```

Clone the repo

```sh
git clone https://github.com/angelojea/dynamics-ts-webpack.git
```

Navigate to the local repo

```sh
cd dynamics-ts-webpack
```

Run the command below to install all dependencies

```sh
npm i
```

Happy coding!! ;)


## Examples

* Creating a new module

```sh
npm run new-module
```

* Creating a new library

```sh
npm run new-lib
```
* <span>[BETA]</span> Generate the model classes

1. On the file *scaffold/common.js* adjust the *crmConfig* section with the credentials to authenticate to your Dynamics instance

```javascript
    crmConfig: {
        url: 'https://org94ea73b8.crm.dynamics.com/',
        clientId: "3001a7d0-b4e5-43e6-9213-20a879b3833b",
        clientSecret: "qfl7Q~sJrm0P0X09p3xc3s.y5jWnAskolTliP",
        azureTenantId: '05cada01-c884-4f47-9e36-a315c58eaa07'
    }
```

2. Run the command below

```sh
npm run generate-models
```

## License

This project is licensed under the terms of the [MIT license](/LICENSE).