# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install [nvm][nvm] to have an isolated Node environment

2. Make a new node environment

```bash
nvm install 22
nvm use 22
```

3. Install dependencies

```bash
npm install
```

4. Ask someone for environment variables, then validate them:

```sh
touch .env.local
npx varlock load
```

5. Create a development build

This is necessary to run the app locally on iOS simulator. See [development builds](https://docs.expo.dev/develop/development-builds/introduction/).

```bash
eas build --platform ios --profile ios-simulator
```

After the build is complete, it should ask if you want to install the build on the iOS simulator. Say yes.

Unfortunately, `react-native-maps` is not supported with Expo Go, so we'll need to use a development build to run with `npx expo start`. [Reference](https://github.com/react-native-maps/react-native-maps/issues/5688#issuecomment-3209957516).

1. Start the app

```bash
npx expo start
```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Make a build

If you don't want to run the app locally with Expo Go, the below is how to make a build.

Make a local build to test with

```bash
eas build --platform ios --profile ios-simulator
```

Make a prebuild

```bash
npx expo prebuild --platform ios
```

Make a build and submit to Apple

```bash
eas build --platform ios --auto-submit
eas submit --platform ios
```

Make an update for expo-update

```bash
eas update --channel production
```

Deploy server functions

```bash
npx expo export -p web && eas deploy --prod
```

## Running Android on Mac

https://docs.expo.dev/workflow/android-studio-emulator/

https://docs.expo.dev/develop/development-builds/create-a-build/#build-the-native-app-android

[nvm]: https://github.com/nvm-sh/nvm