# RN

## 项目

`npx expo prebuild`

`npx pod-install`

`npx expo start`

在 xcode 中打开编译内容：`open ios/app.xcworkspace`

## RN 基本概念

React Native 是一个用于构建跨平台移动应用的框架，允许开发者使用 JavaScript 和 React 编写 iOS 和 Android 应用。它的运行原理结合了 JavaScript 和原生代码，提供了高性能和良好的用户体验。以下是 React Native 的运行原理的详细介绍：

### 核心概念

1. **JavaScript 线程**：

   - 运行你的 JavaScript 代码，包括 React 组件、业务逻辑和状态管理。
   - 通过 React 的声明式编程模型来描述 UI。

2. **原生线程**：

   - 包括主线程（UI 线程）和其他后台线程，负责渲染 UI 和处理原生模块的调用。

3. **桥（Bridge）**：
   - 连接 JavaScript 线程和原生线程。
   - 负责在 JavaScript 和原生代码之间传递数据和调用方法。
   - 使用异步消息传递机制，确保两者之间的通信不会阻塞彼此的执行。

### 运行原理

#### 1. 初始化

当应用启动时：

- React Native 加载 JavaScript 代码包（通常由 Metro Bundler 打包）。
- 初始化 JavaScript 运行环境（如 JSC、Hermes）。
- 执行入口文件（通常是 `index.js`），启动 React 应用。

#### 2. React 渲染

- React 解析应用的根组件，并构建虚拟 DOM（Virtual DOM）。
- 虚拟 DOM 描述了 UI 的结构和状态，但不直接与平台的原生 UI 元素交互。

#### 3. Bridge 通信

- 虚拟 DOM 的变化通过桥传递给原生线程。
- 桥将 JavaScript 对象转换为原生对象（如 UIView、TextView），并调用相应的原生 API 来更新 UI。

#### 4. 原生模块

- 某些功能需要使用平台特定的 API（如相机、位置服务、存储）。
- React Native 提供了一组原生模块（Native Modules），封装了常用的原生功能。
- JavaScript 可以通过桥调用这些原生模块的方法，原生模块也可以通过桥向 JavaScript 发送事件。

### 运行示例

以下是一个简单的 React Native 应用的工作流程示例：

1. **编写 JavaScript 代码**：

```jsx
import React from "react";
import { View, Text, Button } from "react-native";

const App = () => {
  const handlePress = () => {
    console.log("Button pressed");
  };

  return (
    <View>
      <Text>Hello, React Native!</Text>
      <Button title="Press me" onPress={handlePress} />
    </View>
  );
};

export default App;
```

2. **渲染和桥通信**：
   - `App` 组件被渲染，生成虚拟 DOM。
   - 虚拟 DOM 通过桥传递给原生线程。
   - 原生线程创建和布局 `UIView` 和 `UIButton` 元素。
   - 当用户点击按钮时，`onPress` 事件通过桥传回 JavaScript 线程，调用 `handlePress` 函数。

### 优化和性能

React Native 的性能优化涉及多方面，包括减少桥的通信次数、优化 JavaScript 代码执行、使用高效的布局引擎（如 Yoga）等。通过这些优化，React Native 能够在保留良好开发体验的同时提供接近原生的性能。

### 未来展望

React Native 社区不断发展，引入了许多新特性和优化，例如：

- **Fabric**：新的渲染引擎，提高了并发处理和性能。
- **TurboModules**：改进的原生模块系统，提供更高效的模块加载和调用。
- **Hermes**：优化的 JavaScript 引擎，专门为移动设备设计，提高了启动时间和内存使用效率。

通过这些改进，React Native 变得更加高效和强大，继续在跨平台移动开发中占据重要地位。

## RN 常用组件

React Native 是一个用来构建跨平台移动应用的框架，它提供了一系列常用的组件，帮助开发者快速构建用户界面。以下是一些 React Native 中的常用组件及其简介：

### 1. **View**

- 类似于 HTML 的 `<div>`，用于布局和容器。
- 可以包含其他组件。

### 2. **Text**

- 用于显示文本内容。
- 支持样式和事件处理。

### 3. **Image**

- 用于显示图片。
- 支持本地和网络图片资源。

### 4. **ScrollView**

- 用于创建可滚动的视图。
- 适用于少量内容的滚动。

### 5. **FlatList**

- 高效的列表组件，适用于长列表。
- 支持懒加载和优化性能。

### 6. **SectionList**

- 类似于 FlatList，但支持分组显示数据。
- 每个组都有一个头部。

### 7. **TouchableOpacity**

- 用于处理点击事件。
- 点击时会有透明度变化的视觉反馈。

### 8. **TouchableHighlight**

- 用于处理点击事件。
- 点击时背景颜色会变化。

### 9. **Button**

- 简单的按钮组件。
- 提供基本的点击事件处理。

### 10. **TextInput**

- 用于文本输入。
- 支持多种输入类型和样式。

### 11. **Modal**

- 用于显示模态对话框。
- 通常用于提示、警告或其他需要用户关注的内容。

### 12. **Picker**

- 用于选择项列表。
- 适用于选择一个值的场景。

### 13. **Switch**

- 用于切换开关状态。
- 类似于 iOS 的开关控件。

### 14. **ActivityIndicator**

- 用于显示加载状态的指示器。
- 通常用于网络请求或数据加载时。

### 15. **StatusBar**

- 用于控制设备状态栏的外观。
- 可以设置状态栏的颜色、样式等。

### 16. **SafeAreaView**

- 用于在 iOS 设备上处理安全区域的视图。
- 确保内容不会被刘海或底部手势区域覆盖。

### 17. **Pressable**

- 更灵活的触摸处理组件，支持更多事件。
- 可用于替代 Touchable 系列组件。

## rn navigation

```
navigation.dispatch(state => {
  const routesLength = state.routes.length;
  const routes = state.routes.slice(0, routesLength - 2);
  return CommonActions.reset({
    ...state,
    routes,
    index: routesLength - 3
  });
});
```

## expo 文件路由

Expo 支持文件路由功能，通过文件系统结构自动设置应用程序的导航。此功能主要通过 `expo-router` 实现，它允许你使用文件系统作为路由的来源，而不需要手动配置路由。

### 设置 `expo-router`

1. **安装依赖**：

   首先，你需要在 Expo 项目中安装 `expo-router`：

   ```bash
   npx expo install expo-router
   ```

2. **配置项目**：

   你的项目结构将需要包含一个名为 `app` 的目录，这个目录将包含你的路由文件。

### 典型的 `expo-router` 项目结构

```
my-new-project/
├── app/
│   ├── _layout.js
│   ├── index.js
│   ├── profile.js
│   └── settings/
│       └── index.js
├── assets/
├── node_modules/
├── App.js
├── app.json
├── babel.config.js
├── package.json
└── README.md
```

### 文件路由说明

- **`app/_layout.js`**：

  - 布局文件，用于定义页面的公共布局。每个页面都会包含在这个布局内。

  ```jsx
  import { Slot } from "expo-router";

  export default function Layout() {
    return <Slot />;
  }
  ```

- **`app/index.js`**：

  - 主页文件，对应路径 `/`。

  ```jsx
  import { View, Text } from "react-native";

  export default function Home() {
    return (
      <View>
        <Text>Home Page</Text>
      </View>
    );
  }
  ```

- **`app/profile.js`**：

  - Profile 页面文件，对应路径 `/profile`。

  ```jsx
  import { View, Text } from "react-native";

  export default function Profile() {
    return (
      <View>
        <Text>Profile Page</Text>
      </View>
    );
  }
  ```

- **`app/settings/index.js`**：

  - Settings 页面文件，对应路径 `/settings`。

  ```jsx
  import { View, Text } from "react-native";

  export default function Settings() {
    return (
      <View>
        <Text>Settings Page</Text>
      </View>
    );
  }
  ```

### 动态路由

你还可以使用动态路由和捕获组。

- **动态路由**：

  - 使用方括号定义动态路由，例如 `app/[id].js`，对应路径 `/123`。

  ```jsx
  import { useRouter } from "expo-router";
  import { View, Text } from "react-native";

  export default function DynamicPage() {
    const { query } = useRouter();
    const { id } = query;

    return (
      <View>
        <Text>Dynamic Page ID: {id}</Text>
      </View>
    );
  }
  ```

- **捕获组**：

  - 捕获所有未匹配的路径，例如 `app/[...missing].js`，对应路径 `/any/path/you/want`。

  ```jsx
  import { View, Text } from "react-native";

  export default function MissingPage() {
    return (
      <View>
        <Text>Page Not Found</Text>
      </View>
    );
  }
  ```

### 导航

使用 `expo-router` 的 `Link` 组件进行导航：

```jsx
import { View, Text } from "react-native";
import { Link } from "expo-router";

export default function Home() {
  return (
    <View>
      <Text>Home Page</Text>
      <Link href="/profile">Go to Profile</Link>
    </View>
  );
}
```

### `useRouter`和`useNavigation`

`useRouter`和`useNavigation`都是用于在 React Navigation 库中进行路由和导航的 Hooks，但它们有一些不同的用途和功能：

1. **useNavigation**：

   - 主要用于获取导航对象，它提供了一些常用的方法，如 `navigate`、`goBack`、`reset` 等。
   - 适用于需要进行导航操作的组件。

   ```javascript
   import { useNavigation } from "@react-navigation/native";

   const MyComponent = () => {
     const navigation = useNavigation();

     const goToHome = () => {
       navigation.navigate("Home");
     };

     return <Button onPress={goToHome} title="Go to Home" />;
   };
   ```

2. **useRouter**：

   - 主要用于获取路由信息，包括当前路由的参数、路径等。
   - 适合需要访问路由状态的组件，例如获取传递的参数或检查当前路由。

   ```javascript
   import { useRouter } from "next/router"; // 如果是使用 Next.js

   const MyComponent = () => {
     const router = useRouter();
     const { id } = router.query; // 获取路由参数

     return <Text>Current ID: {id}</Text>;
   };
   ```

总结来说，`useNavigation`更多用于导航行为，而`useRouter`则用于获取路由信息。在 React Navigation 中，一般使用`useNavigation`来处理导航操作，而如果需要获取路由信息，可能需要用到`useRoute`（在 React Navigation 中）来获取当前路由的详细信息。

### 总结

通过 `expo-router`，你可以使用文件系统结构自动配置路由，从而简化导航设置。了解并利用文件路由功能，可以更高效地构建和维护你的 Expo 应用。

## 在 React Native 项目中集成游戏库需要考虑到 React Native 的跨平台特性和对原生模块的支持。以下是一些可以在 React Native 项目中集成使用的库：

1. **Three.js (通过 React Three Fiber)**：

   - **描述**：Three.js 是一个强大的 3D 图形库，而 React Three Fiber 是一个将 Three.js 集成到 React 中的库。
   - **特点**：可以在 React Native 中使用 Three.js 来创建复杂的 3D 场景。
   - **库**：[React Three Fiber](https://github.com/pmndrs/react-three-fiber)

2. **PixiJS (通过 React Native Pixi)**：

   - **描述**：PixiJS 是一个快速的 2D 渲染引擎，React Native Pixi 是一个将 PixiJS 集成到 React Native 中的库。
   - **特点**：支持高性能 2D 渲染，可以用于创建卡片游戏。
   - **库**：[React Native Pixi](https://github.com/holidaypirates/react-native-pixi)

3. **Phaser (通过 React Native Phaser Bridge)**：

   - **描述**：Phaser 是一个流行的 2D 游戏框架，React Native Phaser Bridge 可以将 Phaser 集成到 React Native 中。
   - **特点**：适合制作 2D 卡片游戏，支持丰富的游戏特效和插件。
   - **库**：[React Native Phaser Bridge](https://github.com/gecol/react-native-phaser)

4. **Unity (通过 Unity WebGL 和 React Native WebView)**：

   - **描述**：Unity 是一个功能强大的游戏引擎，可以通过导出 WebGL 版本并使用 React Native 的 WebView 组件来集成到 React Native 中。
   - **特点**：支持 2D 和 3D 游戏开发，强大的编辑器和社区支持。
   - **库**：[React Native WebView](https://github.com/react-native-webview/react-native-webview)

5. **GDevelop (通过 WebView)**：
   - **描述**：GDevelop 是一个开源的跨平台游戏引擎，可以导出 HTML5 游戏并通过 React Native 的 WebView 组件嵌入到应用中。
   - **特点**：无需编程，适合初学者，直观的事件系统。
   - **库**：[React Native WebView](https://github.com/react-native-webview/react-native-webview)

这些库和框架可以帮助你在 React Native 项目中集成卡片游戏，根据具体需求选择合适的库或框架，并参考相应的文档进行集成和开发。

## Style

React Native 的样式系统在许多方面类似于 CSS，但也有一些关键的区别和特性。以下是 React Native 样式的要点：

### 1. 使用 `StyleSheet.create`

React Native 提供了 `StyleSheet` 模块，用于定义样式。使用 `StyleSheet.create` 可以集中管理样式，并在性能上进行一些优化。

```javascript
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF",
  },
  text: {
    fontSize: 20,
    textAlign: "center",
    margin: 10,
  },
});
```

### 2. JavaScript 对象样式

样式定义为 JavaScript 对象，使用驼峰命名法，而不是 CSS 的连字符命名法。

```javascript
const styles = {
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF",
  },
  text: {
    fontSize: 20,
    textAlign: "center",
    margin: 10,
  },
};
```

### 3. 没有单位

所有的数值默认使用像素单位，不需要指定单位。

```javascript
const styles = StyleSheet.create({
  text: {
    fontSize: 20, // 20像素
    margin: 10, // 10像素
  },
});
```

### 4. Flexbox 布局

React Native 使用 Flexbox 布局模型来布局组件。需要注意的是，React Native 中 `flexDirection` 默认值是 `column`，而 CSS 中是 `row`。

```javascript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
});
```

### 5. 内联样式

可以使用内联样式直接在组件中定义样式。

```javascript
<Text style={{ color: "blue", fontSize: 16 }}>Hello World!</Text>
```

### 6. 样式组合

可以通过数组组合多个样式对象，后面的样式会覆盖前面的样式。

```javascript
const baseStyles = {
  text: {
    color: "red",
    fontSize: 14,
  },
};

const additionalStyles = {
  text: {
    fontWeight: "bold",
  },
};

<Text style={[baseStyles.text, additionalStyles.text]}>Hello World!</Text>;
```

### 7. 平台特定样式

可以根据平台定义不同的样式。

```javascript
import { StyleSheet, Platform } from "react-native";

const styles = StyleSheet.create({
  text: {
    ...Platform.select({
      ios: {
        fontSize: 20,
      },
      android: {
        fontSize: 18,
      },
    }),
  },
});
```

### 8. 动态样式

可以根据状态或属性动态地应用样式。

```javascript
const MyComponent = ({ isActive }) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.text, isActive && styles.activeText]}>
        Hello World!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "black",
    fontSize: 16,
  },
  activeText: {
    color: "red",
  },
});
```

### 9. 动画样式

React Native 提供了 `Animated` API 来处理动画样式。

```javascript
import React, { useRef, useEffect } from "react";
import { Animated, Text, View } from "react-native";

const FadeInView = (props) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={{ ...props.style, opacity: fadeAnim }}>
      {props.children}
    </Animated.View>
  );
};

export default () => {
  return (
    <FadeInView
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      <Text style={{ fontSize: 28, textAlign: "center", margin: 10 }}>
        Fading in
      </Text>
    </FadeInView>
  );
};
```

通过理解和运用这些要点，你可以有效地使用 React Native 的样式系统来创建美观和响应迅速的移动应用。

## Gesture

`react-native-gesture-handler`是一个用于处理复杂手势和触摸事件的库，为 React Native 应用程序提供了更好的手势控制和性能。它解决了 React Native 内置手势系统的一些限制，特别是在处理嵌套手势和高频率手势时。

### 主要特性

1. **手势识别器**：提供了多种手势识别器，如点击、长按、滑动、平移、捏合、旋转等。
2. **高性能**：手势处理是在原生层进行的，减少了 JavaScript 和原生代码之间的通信开销，提高了性能。
3. **手势状态管理**：可以轻松地跟踪手势的状态变化，如开始、激活、结束等。
4. **与动画结合**：可以与`react-native-reanimated`结合使用，实现平滑的手势驱动动画。

### 安装

你可以使用以下命令安装`react-native-gesture-handler`：

```bash
npm install react-native-gesture-handler
```

### 基本用法

以下是一个简单的示例，演示如何使用`react-native-gesture-handler`处理手势：

```javascript
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  GestureHandlerRootView,
  RectButton,
  PanGestureHandler,
  State,
} from "react-native-gesture-handler";

const App = () => {
  const onGestureEvent = (event) => {
    console.log("Gesture event:", event.nativeEvent);
  };

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.state === State.END) {
      console.log("Gesture ended");
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
      >
        <View style={styles.box}>
          <Text>Drag me!</Text>
        </View>
      </PanGestureHandler>

      <RectButton style={styles.button}>
        <Text>Click me</Text>
      </RectButton>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    width: 100,
    height: 100,
    backgroundColor: "skyblue",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  button: {
    padding: 10,
    backgroundColor: "lightcoral",
    borderRadius: 5,
  },
});

export default App;
```

### 组件和 API

- **GestureHandlerRootView**：必须包装在应用的根组件中，以启用手势处理。
- **PanGestureHandler**：用于处理平移手势。
- **RectButton**：用于替代`TouchableOpacity`，具有更好的触摸性能。

### 常见手势处理器

- **TapGestureHandler**：处理点击手势。
- **LongPressGestureHandler**：处理长按手势。
- **FlingGestureHandler**：处理快速滑动手势。
- **PinchGestureHandler**：处理捏合手势。
- **RotationGestureHandler**：处理旋转手势。

`react-native-gesture-handler`非常适合需要处理复杂手势的应用，例如图像编辑器、绘图应用、交互式地图等。结合`react-native-reanimated`，可以实现平滑的手势驱动动画效果。

### event

```
export declare type PanGestureHandlerEventPayload = {
    /**
     * X coordinate of the current position of the pointer (finger or a leading
     * pointer when there are multiple fingers placed) relative to the view
     * attached to the handler. Expressed in point units.
     */
    x: number;
    /**
     * Y coordinate of the current position of the pointer (finger or a leading
     * pointer when there are multiple fingers placed) relative to the view
     * attached to the handler. Expressed in point units.
     */
    y: number;
    /**
     * X coordinate of the current position of the pointer (finger or a leading
     * pointer when there are multiple fingers placed) relative to the window.
     * The value is expressed in point units. It is recommended to use it instead
     * of `x` in cases when the original view can be transformed as an effect of
     * the gesture.
     */
    absoluteX: number;
    /**
     * Y coordinate of the current position of the pointer (finger or a leading
     * pointer when there are multiple fingers placed) relative to the window.
     * The value is expressed in point units. It is recommended to use it instead
     * of `y` in cases when the original view can be transformed as an
     * effect of the gesture.
     */
    absoluteY: number;
    /**
     * Translation of the pan gesture along X axis accumulated over the time of
     * the gesture. The value is expressed in the point units.
     */
    translationX: number;
    /**
     * Translation of the pan gesture along Y axis accumulated over the time of
     * the gesture. The value is expressed in the point units.
     */
    translationY: number;
    /**
     * Velocity of the pan gesture along the X axis in the current moment. The
     * value is expressed in point units per second.
     */
    velocityX: number;
    /**
     * Velocity of the pan gesture along the Y axis in the current moment. The
     * value is expressed in point units per second.
     */
    velocityY: number;
};
```

```
{"absoluteX": 127.33332824707031, "absoluteY": 145, "eventName": "987onGestureHandlerStateChange", "handlerTag": 8, "numberOfPointers": 0, "oldState": 4, "state": 5, "target": 987, "translationX": -26.666671752929716, "translationY": 5.6666717529296875, "velocityX": 52.637887894639306, "velocityY": 0, "x": 112.66666222943218, "y": 29.66666640175714}
```

# SVG

## Path

SVG（可缩放矢量图形）中的`<path>`元素是用来绘制复杂形状的强大工具。`<path>`元素通过一系列命令和参数来定义路径，这些命令和参数控制路径的绘制方式。以下是对`<path>`元素及其绘制规则的简要介绍：

### 基本结构

```xml
<path d="M10 10 H 90 V 90 H 10 L 10 10" />
```

### 路径命令

路径命令由字母（大写或小写）表示，每个字母后面跟随一个或多个参数。大写字母表示绝对坐标，小写字母表示相对坐标。

### 常见命令

- **M (moveto)**: 移动到指定坐标。起始点或移动到一个新的点。

  - 绝对：`M x y`
  - 相对：`m dx dy`

- **L (lineto)**: 从当前点绘制直线到指定坐标。

  - 绝对：`L x y`
  - 相对：`l dx dy`

- **H (horizontal lineto)**: 从当前点绘制水平直线到指定的 x 坐标。

  - 绝对：`H x`
  - 相对：`h dx`

- **V (vertical lineto)**: 从当前点绘制垂直直线到指定的 y 坐标。

  - 绝对：`V y`
  - 相对：`v dy`

- **C (curveto)**: 从当前点绘制三次贝塞尔曲线到指定坐标，需要两个控制点和一个结束点。

  - 绝对：`C x1 y1, x2 y2, x y`
  - 相对：`c dx1 dy1, dx2 dy2, dx dy`

- **S (smooth curveto)**: 从当前点绘制平滑的三次贝塞尔曲线，不需要第一个控制点，使用前一个曲线的终点作为第一个控制点。

  - 绝对：`S x2 y2, x y`
  - 相对：`s dx2 dy2, dx dy`

- **Q (quadratic Bézier curve)**: 从当前点绘制二次贝塞尔曲线到指定坐标，需要一个控制点和一个结束点。

  - 绝对：`Q x1 y1, x y`
  - 相对：`q dx1 dy1, dx dy`

- **T (smooth quadratic Bézier curveto)**: 从当前点绘制平滑的二次贝塞尔曲线，不需要控制点，使用前一个曲线的终点作为控制点。

  - 绝对：`T x y`
  - 相对：`t dx dy`

- **A (elliptical Arc)**: 从当前点绘制椭圆弧到指定坐标。

  - 绝对：`A rx ry x-axis-rotation large-arc-flag sweep-flag x y`
  - 相对：`a rx ry x-axis-rotation large-arc-flag sweep-flag dx dy`

- **Z (closepath)**: 闭合路径，绘制直线从当前点到路径起始点。
  - 绝对和相对都一样：`Z` 或 `z`

### 示例

1. **简单直线和闭合路径**

```xml
<path d="M10 10 H 90 V 90 H 10 Z" />
```

2. **贝塞尔曲线**

```xml
<path d="M10 80 C 40 10, 65 10, 95 80 S 150 150, 180 80" />
```

3. **椭圆弧**

```xml
<path d="M10 80 A 45 45, 0, 0, 0, 125 125 L 125 80 Z" />
```

### 可视化解释

- `M10 10`：移动到(10,10)。
- `H 90`：水平线到 x=90。
- `V 90`：垂直线到 y=90。
- `H 10`：水平线回到 x=10。
- `Z`：闭合路径。

通过理解这些基本命令和参数，你可以绘制出各种复杂的形状和路径。
