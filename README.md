# react-native-typical
React native version of react-typical package.

## Motivation
While working with react native and after few hours into trial and error of making react-typical work, I realized the React.createElement used in the library doesn't work as expected in react native as its not possible to get text from `Text` component (I am new to react native so hey no judjing if its not that hard afterall).
So I wrapped the existing react-typical in react native Text component and ta da...

## Installation
```
npm install --save react-native-typical
or
expo install react-native-typical
```

## Usage
```jsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import TypingText from "react-native-typical";

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <TypingText
        steps={["Hello there", 1000, "Hello World !!!", 1000]}
        loop={Infinity}
        style={[styles.text]}/>
      <TypingText
        steps={["This will run some time only",
                    1000, "This will run 5 times only", 1000]}
        loop={5}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text:{
      fontSize: 14
  }
});

```

## Properties
| Name  | Type                | Example                               |
|-------| --------------------| ------------------------------------- |
| steps | Array []            | ["string", 1000, "some more", 1000]   |
| loop  | number              | 5, 10, Infinity etc.                  |
| style | react native styles | `{[styles.text, {fontSize: 50}]}` etc.|

----------

### Annotations
This library is inspired from [react-typical](https://github.com/catalinmiron/react-typical) (for web) and logic is based on [@camwiegert](https://github.com/camwiegert/typical)'s light weight library.
