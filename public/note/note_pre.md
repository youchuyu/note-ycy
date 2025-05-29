# JS

## this

this 的值表示当前执行的环境对象，而与声明环境无关，所以 this 代表的对象要等函数运行时才确定。类似定义函数时的参数列表，只有在函数调用时才传入真正的对象。this 关键字虽然会根据环境变化，但它始终代表的是调用当前函数的对象。

javascript 允许在函数体内，引用当前环境的其他变量

this 总是返回一个对象，简单说，就是返回属性或方法“当前”所在的对象

this 的值是在函数执行时决定的，不是在函数定义时决定的（箭头函数的 this 是在定义时就决定了）。

- 普通函数：func(args…)实际上是 func.call(window, args…)的语法糖。
- 对象函数：a.func(args…)实际上是 a.func.call(a, args…)的语法糖
- 箭头函数的 this 和上一级作用域的 this 相同：箭头函数的 this 是在函数定义时绑定的，而不是执行时绑定的。实际上箭头函数本身没有 this，导致内层的 this 就是外部代码块的 this（父级元素的 this）。因此不能用作构造函数。

## call / apply / bind

call 和 apply，假设要改变 fn 函数内部的 this 的指向，指向 obj，那么可以 fn.call(obj);或者 fn.apply(obj);

call 和 apply 的区别在于参数，他们两个的第一个参数都是一样的，表示调用该函数的对象，apply 的第二个参数是数组，是[arg1, arg2, arg3]这种形式，而 call 是 arg1, arg2, arg3 这样的形式。

bind 函数，var bar = fn.bind(obj); 那么 fn 中的 this 就指向 obj 对象了，bind 函数返回新的函数，这个函数内的 this 指针指向 obj 对象。

## JavaScript 的作用域和变量提升

## 模块化

ESM（ECMAScript Modules）和 CJS（CommonJS）是两种不同的 JavaScript 模块系统，它们在语法、特性、使用场景等方面存在一些显著的区别。以下是对这两种模块系统的详细比较。

### 概述

- **ESM（ECMAScript Modules）**：

  - 标准化的模块系统，由 ECMAScript 2015（ES6）引入。
  - 使用 `import` 和 `export` 语法。
  - 静态模块解析，在编译时确定依赖关系。
  - 支持 tree shaking。

- **CJS（CommonJS）**：
  - 主要用于 Node.js 环境的模块系统。
  - 使用 `require` 和 `module.exports` 语法。
  - 动态模块解析，在运行时确定依赖关系。

### 特性和行为

#### 静态 vs 动态解析

- **ESM**：

  - 静态解析，模块依赖关系在编译时确定。
  - 便于工具（如 Webpack、Rollup）进行优化，如 tree shaking。

- **CJS**：
  - 动态解析，模块依赖关系在运行时确定。
  - 更灵活，可以根据条件动态加载模块。

#### 导入导出方式

- **ESM**：

  - 支持命名导出和默认导出。
  - `import` 和 `export` 语法只能在模块的顶层使用，不能在条件语句或函数内部。

- **CJS**：
  - `module.exports` 和 `exports` 用于导出，可以是对象、函数、类等任意类型。
  - `require` 可以在代码的任何地方使用，包括条件语句或函数内部。

#### 兼容性

- **ESM**：

  - 在现代浏览器中原生支持。
  - Node.js 也支持 ESM 模块，但需要在 `package.json` 中设置 `"type": "module"` 或使用 `.mjs` 文件扩展名。

- **CJS**：
  - 原生支持于 Node.js。
  - 在浏览器中使用时需要打包工具（如 Webpack、Browserify）进行转换。

### 性能和优化

- **ESM**：

  - 由于静态结构，编译器和打包工具可以进行优化，如 tree shaking。
  - 更适合现代前端开发，因为浏览器和工具链对其支持更好。

- **CJS**：
  - 动态特性使其在某些场景下更加灵活，但也可能导致性能开销。
  - 在服务器端（Node.js 环境）表现良好，因其动态加载特性有助于按需加载模块。

### 使用场景

- **ESM**：

  - 现代前端开发，特别是使用工具链（如 Webpack、Rollup、Parcel）进行打包的项目。
  - 希望利用静态分析和优化特性的项目。

- **CJS**：
  - Node.js 环境下的服务器端开发。
  - 需要动态加载模块的场景。

### 互操作性

- **从 ESM 导入 CJS 模块**：

  - 可以使用 `import` 语法直接导入 CJS 模块，CJS 的 `module.exports` 会被视为默认导出。

  ```javascript
  import cjsModule from "./cjsModule";
  ```

- **从 CJS 导入 ESM 模块**：

  - 需要使用 `import()` 动态导入函数，因为 `require` 不能直接导入 ESM 模块。

  ```javascript
  (async () => {
    const esmModule = await import("./esmModule.mjs");
  })();
  ```

### 总结

- **ESM** 是现代 JavaScript 模块的标准，具有静态解析、优化支持和更好的前端工具链集成。适合前端开发和希望利用现代工具优化的项目。
- **CJS** 是 Node.js 的默认模块系统，具有动态解析和灵活性，更适合传统的 Node.js 应用和需要按需加载模块的场景。

## 事件循环

事件循环（Event Loop）是现代 JavaScript 运行时（如浏览器和 Node.js）中处理异步编程的核心机制。它使得 JavaScript 能够在单线程环境中执行异步操作，如 I/O 操作、计时器和用户交互。以下是对事件循环的详细介绍，包括其工作原理、组成部分和实际应用。

### 事件循环的组成部分

1. **调用栈（Call Stack）**

   - 执行同步代码的栈结构。每当函数调用时，会被压入栈中，函数执行完毕后会被弹出。

2. **消息队列（Message Queue）**

   - 存放待处理的消息（任务）。这些消息是异步操作完成后的回调函数，例如定时器的回调、事件处理函数、I/O 操作的回调等。
   - 注：尽管在 JavaScript 的事件循环中，处理网络请求的回调（即 await fetch 的后续操作）通过微任务队列完成，但网络请求本身仍然是典型的 I/O 操作。

3. **事件循环（Event Loop）**

   - 不断检查调用栈是否为空，如果为空则检查消息队列是否有待处理的消息。如果有，将消息出队并压入调用栈执行。

4. **微任务队列（Microtask Queue）**
   - 存放微任务（Microtasks），如 `Promise` 的回调和 `MutationObserver` 的回调。微任务的优先级高于普通任务。

### 事件循环的工作原理

1. **执行全局代码**：

   - 事件循环从执行全局代码开始，这些代码通常是同步代码，会被压入调用栈并依次执行。

2. **处理微任务**：

   - 一旦调用栈为空，事件循环会检查微任务队列，并按顺序执行所有的微任务。每当一个微任务完成后，如果产生了新的微任务，也会被添加到队列中。

3. **处理消息队列**：

   - 在所有微任务执行完毕后，事件循环会检查消息队列。如果队列中有消息，将其出队并执行。消息执行过程中，如果有新的任务（如回调）被加入微任务队列，这些任务会在当前消息处理完后立即执行。

4. **重复上述步骤**：
   - 事件循环会持续上述步骤，确保异步任务能够被及时处理。

### 图示说明

```
  ┌───────────────────┐
  │      执行栈       │
  │ ┌───────────────┐ │
  │ │     全局       │ │
  │ │     执行       │ │
  │ │     代码       │ │
  │ └───────────────┘ │
  └───────────────────┘
           ↓
  ┌───────────────────┐
  │    微任务队列     │
  │ ┌───────────────┐ │
  │ │ Promise.then() │ │
  │ │ MutationObs.   │ │
  │ └───────────────┘ │
  └───────────────────┘
           ↓
  ┌───────────────────┐
  │    消息队列       │
  │ ┌───────────────┐ │
  │ │ setTimeout()   │ │
  │ │ I/O callbacks  │ │
  │ └───────────────┘ │
  └───────────────────┘
```

### 实际应用示例

```javascript
console.log("Start");

setTimeout(() => {
  console.log("Timeout");
}, 0);

Promise.resolve().then(() => {
  console.log("Promise");
});

console.log("End");
```

**执行顺序分析**：

1. **执行全局代码**：将 `console.log('Start')` 和 `console.log('End')` 压入调用栈并执行，输出 `Start` 和 `End`。
2. **处理微任务**：`Promise.resolve().then()` 将回调函数添加到微任务队列，执行该回调，输出 `Promise`。
3. **处理消息队列**：`setTimeout` 回调被添加到消息队列，事件循环执行该回调，输出 `Timeout`。

最终输出顺序：

```
Start
End
Promise
Timeout
```

### 总结

事件循环是 JavaScript 中处理异步操作的关键机制，使得单线程环境能够高效地处理 I/O 操作、计时器和其他异步任务。通过理解事件循环的工作原理，可以更好地编写高性能、无阻塞的 JavaScript 代码。

## JS 原型链

JavaScript 的原型链（prototype chain）是其实现继承的一种机制，通过这种机制，一个对象可以访问另一个对象的属性和方法。了解原型链对于理解 JavaScript 的继承和对象创建非常重要。

### 基本概念

1. **原型对象（Prototype Object）**:
   每个 JavaScript 对象都有一个内部链接到另一个对象的属性，这个对象称为其原型（prototype）。原型对象本身也可能有一个原型，直到一个对象的原型为 `null`。这个终点对象称为原型链的末端。

2. **原型链（Prototype Chain）**:
   当访问一个对象的属性或方法时，如果对象自身不存在该属性或方法，JavaScript 会沿着原型链向上查找，直到找到该属性或方法或到达链的末端。

### 创建对象和原型链

#### 1. 使用对象字面量创建对象

```javascript
const obj = {
  name: "John",
  age: 30,
};

console.log(obj.toString()); // 通过原型链找到 Object.prototype.toString
```

在这个例子中，对象 `obj` 没有 `toString` 方法，但通过原型链找到了 `Object.prototype.toString`。

#### 2. 使用构造函数创建对象

```javascript
function Person(name, age) {
  this.name = name;
  this.age = age;
}

Person.prototype.greet = function () {
  console.log(`Hello, my name is ${this.name}`);
};

const john = new Person("John", 30);
john.greet(); // Hello, my name is John
```

在这个例子中，`john` 对象的原型是 `Person.prototype`，而 `Person.prototype` 的原型是 `Object.prototype`。

### 原型链的示意图

假设有以下代码：

```javascript
function Animal(name) {
  this.name = name;
}

Animal.prototype.speak = function () {
  console.log(`${this.name} makes a noise.`);
};

function Dog(name) {
  Animal.call(this, name);
}

Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

Dog.prototype.bark = function () {
  console.log(`${this.name} barks.`);
};

const rex = new Dog("Rex");
```

原型链示意图如下：

```
rex -> Dog.prototype -> Animal.prototype -> Object.prototype -> null
```

### 原型链的属性查找机制

当访问 `rex.bark()` 时，JavaScript 引擎会按以下步骤查找：

1. 检查 `rex` 对象本身是否有 `bark` 属性。
2. 如果没有，检查 `Dog.prototype` 对象是否有 `bark` 属性。
3. 找到 `bark` 方法并执行。

当访问 `rex.speak()` 时：

1. 检查 `rex` 对象本身是否有 `speak` 属性。
2. 如果没有，检查 `Dog.prototype` 对象是否有 `speak` 属性。
3. 如果没有，检查 `Animal.prototype` 对象是否有 `speak` 属性。
4. 找到 `speak` 方法并执行。

### `hasOwnProperty` 方法

`hasOwnProperty` 方法可以用来检查某个属性是否为对象自身的属性（即，不是从原型链继承的属性）。

```javascript
console.log(rex.hasOwnProperty("name")); // true
console.log(rex.hasOwnProperty("bark")); // false
```

### 总结

JavaScript 的原型链是实现继承的基础机制。通过原型链，对象可以共享属性和方法，而不需要重复定义。理解原型链有助于更好地掌握 JavaScript 的面向对象编程技巧，从而编写出更高效和可维护的代码。

# TS

## 类型守卫

TypeScript 中的类型守卫（Type Guards）用于在运行时确保变量具有某种特定的类型。类型守卫可以使 TypeScript 更加智能地理解代码中的类型，从而提供更强的类型安全性和更好的开发体验。类型守卫主要有以下几种形式：

### 1. `typeof` 类型守卫

`typeof` 操作符用于判断一个变量的类型。常见的类型有 `"string"`, `"number"`, `"boolean"`, `"symbol"`, `"undefined"`, `"object"`, `"function"`。

**示例：**

```typescript
function isNumber(x: any): x is number {
  return typeof x === "number";
}

function example(value: number | string) {
  if (isNumber(value)) {
    // 在这个分支中，TypeScript 知道 value 是 number
    console.log(value.toFixed(2));
  } else {
    // 在这个分支中，TypeScript 知道 value 是 string
    console.log(value.toUpperCase());
  }
}
```

### 2. `instanceof` 类型守卫

`instanceof` 操作符用于判断对象是否是某个类的实例。

**示例：**

```typescript
class Dog {
  bark() {
    console.log("Woof!");
  }
}

class Cat {
  meow() {
    console.log("Meow!");
  }
}

function example(pet: Dog | Cat) {
  if (pet instanceof Dog) {
    // 在这个分支中，TypeScript 知道 pet 是 Dog
    pet.bark();
  } else {
    // 在这个分支中，TypeScript 知道 pet 是 Cat
    pet.meow();
  }
}
```

### 3. 自定义类型守卫

自定义类型守卫使用类型谓词来定义。类型谓词是 `parameterName is Type` 形式，用于表示某个变量在特定条件下是某种类型。

**示例：**

```typescript
interface Fish {
  swim(): void;
}

interface Bird {
  fly(): void;
}

function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined;
}

function example(pet: Fish | Bird) {
  if (isFish(pet)) {
    // 在这个分支中，TypeScript 知道 pet 是 Fish
    pet.swim();
  } else {
    // 在这个分支中，TypeScript 知道 pet 是 Bird
    pet.fly();
  }
}
```

### 4. `in` 操作符

`in` 操作符用于判断某个属性是否存在于对象中。

**示例：**

```typescript
interface Fish {
  swim(): void;
}

interface Bird {
  fly(): void;
}

function example(pet: Fish | Bird) {
  if ("swim" in pet) {
    // 在这个分支中，TypeScript 知道 pet 是 Fish
    pet.swim();
  } else {
    // 在这个分支中，TypeScript 知道 pet 是 Bird
    pet.fly();
  }
}
```

### 5. 联合类型和类型守卫

通过联合类型和类型守卫，TypeScript 可以在编译时对不同类型进行区分和处理。

**示例：**

```typescript
type StringOrNumber = string | number;

function example(value: StringOrNumber) {
  if (typeof value === "string") {
    // 在这个分支中，TypeScript 知道 value 是 string
    console.log(value.toUpperCase());
  } else {
    // 在这个分支中，TypeScript 知道 value 是 number
    console.log(value.toFixed(2));
  }
}
```

### 总结

类型守卫是 TypeScript 中一个强大的功能，可以帮助开发者在运行时确保变量的类型，从而编写出更健壮、更安全的代码。通过 `typeof`、`instanceof`、自定义类型守卫和 `in` 操作符，开发者可以灵活地处理不同的类型情况。

# 网络

## 层级

### 应用层

网络应用程序以及其应用层协议保存的地方。应用层分布在多个端系统上。一个端系统的应用程序使用协议与另一个端系统中的应用程序交换信息分组。位于应用层的信息分组称为：报文(message)。

例如：HTTP

### 传输层

传输层在应用程序端点之间传输应用层报文。应用层回将长报文分割为短报文，这些短报文称为：报文段(segment)。

例如：TCP/UDP

### 网络层

将称为数据报(datagram)的网络层分组从一台主机移动到另一台主机。

例如：

- 网际协议(IP)：定义了在数据报中的各个字段以及端系统和路由器如何作用于这些系统。
- 路由选择协议(许多)：根据路由将数据报从源系统传到目标系统。

### 链路层

将分组从一个节点移到另外一个节点，其提供的服务取决于应用于该链路的特定的链路链路层协议。位于链路层的分组称为：帧(frame)。

数据报从一端传输到另一端常常需要经过几条不同的链路，并被沿途的不同链路的不同链路层协议处理。

例如：以太网、wifi 和电缆接入网的 DOCSIS 协议。

### 物理层

将帧中的一个个比特从一个节点移到到另一个节点。

例如：关于双绞铜线的协议、关于同轴电缆的协议、关于光纤的协议等。

## HTTP 版本

HTTP（HyperText Transfer Protocol）是用于传输超文本的应用层协议。它的不同版本在功能和性能上有显著的差异。以下是对 HTTP/1.0、HTTP/1.1、HTTP/2 和 HTTP/3 的比较：

### HTTP/1.0

**发布年份**: 1996

**特点**:

- **简单性**: 最初的版本，设计简单。
- **无状态**: 每个请求/响应对都是独立的，没有连接复用。
- **连接管理**: 每个请求都需要一个新的 TCP 连接，导致连接开销大。
- **缓存支持**: 提供了基本的缓存控制头（如 `Expires`）。

**缺点**:

- **效率低**: 由于每个请求都需要建立一个新的 TCP 连接，效率低下。
- **慢启动**: 每个新连接都经历 TCP 的慢启动阶段，增加了延迟。

### HTTP/1.1

**发布年份**: 1997

**特点**:

- **持久连接**: 默认支持持久连接（Connection: keep-alive），允许在一个 TCP 连接上传输多个请求/响应对。
- **管道化**: 支持请求管道化，允许在发送前一个响应之前发送多个请求。
- **分块传输编码**: 支持分块传输编码，允许服务器在生成内容时发送响应。
- **更多缓存控制**: 引入了更强大的缓存控制头（如 `Cache-Control`）。

**优点**:

- **连接复用**: 持久连接和管道化减少了连接开销和延迟。
- **扩展性**: 引入了更多的头字段和扩展机制，增强了协议的灵活性。

**缺点**:

- **队头阻塞**: 管道化虽然允许并行发送请求，但由于响应必须按顺序返回，仍然存在队头阻塞问题。

### HTTP/2

**发布年份**: 2015

**特点**:

- **二进制协议**: 使用二进制格式传输数据，而不是文本格式，提高了传输效率。
- **多路复用**: 允许在单个 TCP 连接上同时发送多个请求和响应，解决了队头阻塞问题。
- **头部压缩**: 使用 HPACK 算法对头部进行压缩，减少了传输的数据量。
- **服务器推送**: 允许服务器主动将资源推送到客户端，减少了延迟。

**优点**:

- **性能提升**: 多路复用和头部压缩显著提高了传输性能和效率。
- **低延迟**: 通过多路复用和服务器推送，减少了等待时间和延迟。

**缺点**:

- **复杂性增加**: 二进制协议和多路复用的实现增加了复杂性。
- **队头阻塞（TCP 层）**: 虽然解决了应用层的队头阻塞问题，但在 TCP 层仍然存在队头阻塞。

### HTTP/3

**发布年份**: 2020

**特点**:

- **基于 QUIC**: 使用基于 UDP 的 QUIC 协议代替 TCP，提供更快速和可靠的传输。
- **内置 TLS**: 在传输层集成了 TLS 1.3，提供内置的加密和安全性。
- **更好的多路复用**: 进一步优化了多路复用，完全消除了队头阻塞问题。
- **快速握手**: QUIC 提供了更快速的连接建立和恢复机制，减少了延迟。

**优点**:

- **低延迟**: 基于 QUIC 的快速握手和连接恢复机制，显著减少了延迟。
- **无队头阻塞**: 彻底消除了传输层和应用层的队头阻塞问题。
- **高安全性**: 内置 TLS 1.3 提供了更强的安全性。

**缺点**:

- **UDP 依赖性**: 依赖于 UDP 协议，可能在某些网络环境下受到限制（如防火墙和 NAT 设备的限制）。
- **部署复杂性**: 需要对现有基础设施进行调整和优化，以支持 QUIC 和 HTTP/3。

### 总结

- **HTTP/1.0**: 简单但效率低下，适合早期互联网环境。
- **HTTP/1.1**: 改进了连接管理和缓存机制，显著提高了性能，但仍有队头阻塞问题。
- **HTTP/2**: 引入了多路复用、头部压缩和服务器推送，解决了大部分性能问题，但仍依赖于 TCP。
- **HTTP/3**: 使用基于 UDP 的 QUIC 协议，彻底消除了队头阻塞，并提供了更低的延迟和更高的安全性。

每个版本的 HTTP 都在前一个版本的基础上进行了改进，以适应不断发展的互联网需求和技术进步。HTTP/3 是当前最先进的版本，提供了最佳的性能和安全性，但也需要更复杂的部署和网络支持。

## HTTP 缓存

HTTP 缓存是 Web 性能优化的重要机制，它通过减少冗余的数据传输、降低服务器负载和加快页面加载速度来提高用户体验。HTTP 缓存可以在客户端（浏览器）、代理服务器和 CDN（内容分发网络）等多个层级实现。以下是对 HTTP 缓存的详细介绍，包括其类型、工作原理、主要的 HTTP 头字段以及实际应用。

### 缓存类型

1. **强缓存（Strong Caching）**：

   - **特点**：在缓存未过期之前，不需要向服务器发送请求。
   - **主要头字段**：
     - `Expires`
     - `Cache-Control: max-age`

2. **协商缓存（Conditional Caching）**：
   - **特点**：每次请求都会向服务器确认缓存资源是否有效，服务器根据资源是否变化返回 304 状态码或最新资源。
   - **主要头字段**：
     - `Last-Modified` / `If-Modified-Since`
     - `ETag` / `If-None-Match`

### 主要 HTTP 头字段

#### 1. `Cache-Control`

用于定义缓存策略，可以组合使用多个指令。

- `max-age=<seconds>`：资源在指定时间内有效。
- `no-cache`：强制向服务器验证资源。
- `no-store`：不缓存资源。
- `public`：可以被任何缓存（包括 CDN 等中间代理服务器）缓存。
- `private`：只能被客户端缓存。

示例：

```http
Cache-Control: max-age=3600, public
```

#### 2. `Expires`

指定资源的过期时间，日期格式为 HTTP 日期格式。在指定日期之前，资源被认为是新鲜的。

示例：

```http
Expires: Wed, 21 Oct 2023 07:28:00 GMT
```

#### 3. `Last-Modified` 和 `If-Modified-Since`

- **Last-Modified**：资源的最后修改时间。
- **If-Modified-Since**：客户端在后续请求中使用此头字段携带上次获取资源时的`Last-Modified`时间。

示例：

服务器响应：

```http
Last-Modified: Wed, 21 Oct 2015 07:28:00 GMT
```

客户端后续请求：

```http
If-Modified-Since: Wed, 21 Oct 2015 07:28:00 GMT
```

#### 4. `ETag` 和 `If-None-Match`

- **ETag**：资源的实体标签，用来表示资源的版本。
- **If-None-Match**：客户端在后续请求中使用此头字段携带上次获取资源时的`ETag`值。

示例：

服务器响应：

```http
ETag: "686897696a7c876b7e"
```

客户端后续请求：

```http
If-None-Match: "686897696a7c876b7e"
```

### 工作原理

#### 强缓存

1. **首次请求**：
   - 客户端请求资源。
   - 服务器返回资源和相关的缓存头（如`Cache-Control: max-age=3600`）。
2. **后续请求**：
   - 在缓存有效期内，客户端直接从缓存中获取资源，不发送请求到服务器。

#### 协商缓存

1. **首次请求**：
   - 客户端请求资源。
   - 服务器返回资源和相关的缓存头（如`ETag`或`Last-Modified`）。
2. **后续请求**：
   - 客户端在请求中携带验证头（如`If-None-Match`或`If-Modified-Since`）。
   - 服务器验证资源是否变化。
     - 如果资源未变化，返回 304 状态码，客户端使用缓存。
     - 如果资源已变化，返回最新资源和新的缓存头。

### 实际应用

在实际项目中，可以通过配置 HTTP 服务器或应用代码设置缓存头。例如：

#### Nginx 配置示例

```nginx
location / {
    expires 30d;
    add_header Cache-Control "public, max-age=2592000";
}
```

#### Express.js 配置示例

```javascript
const express = require("express");
const app = express();

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.setHeader("Last-Modified", new Date().toUTCString());
  next();
});

app.get("/resource", (req, res) => {
  res.send("Hello, World!");
});

app.listen(3000);
```

### 缓存策略选择

选择合适的缓存策略需要根据具体的应用场景和需求进行权衡：

- **强缓存**适用于变化不频繁的资源，如静态文件（图片、CSS、JavaScript 等）。
- **协商缓存**适用于变化较频繁的资源，如动态内容、API 响应等。

通过合理配置 HTTP 缓存，可以显著提升 Web 应用的性能和用户体验，减少服务器负载和带宽消耗。

#### 结合使用的策略

结合使用时，通常先设置强缓存策略，让客户端在缓存有效期内直接使用缓存，过期后再通过协商缓存确认资源是否需要更新。这样既能充分利用缓存提升性能，又能确保资源的及时更新。

### 对应的 http 状态

#### 协商缓存

- 200 OK

  - 描述：请求成功，并且服务器返回了资源。
  - 使用场景：当客户端首次请求资源或缓存已过期，服务器返回最新的资源和状态码 200。

- 304 Not Modified

  - 描述：资源未被修改，客户端可以使用缓存副本。
  - 使用场景：当客户端发送带有验证头的请求（如 If-Modified-Since 或 If-None-Match），服务器确认资源未变，返回 304 状态码，而不返回资源内容。

#### 强缓存

缓存有效期内不会发起 HTTP 请求。当缓存时间过期后，浏览器会发起 HTTP 请求以验证资源是否有更新。这通常涉及协商缓存机制，例如 If-Modified-Since 或 If-None-Match 头字段。

## HTTPS

HTTPS 通过以下几个步骤确保数据传输的安全性：

1. 建立 TCP 连接
2. 进行 SSL/TLS 握手
3. 生成对称会话密钥
4. 加密通信数据
5. 终止连接

通过这一系列步骤，HTTPS 能够有效防止数据被窃听和篡改，保障用户和服务器之间的通信安全。

## [CORS](https://www.shubo.io/what-is-cors/)

## 实时通信

WebSocket 和 Server-Sent Events (SSE) 都是用于在客户端和服务器之间进行实时通信的技术，但它们在实现方式和使用场景上有一些关键的区别：

### WebSocket

**WebSocket** 是一种全双工通信协议，允许客户端和服务器之间进行双向通信。它建立在 HTTP 协议之上，但一旦建立连接，通信就不再使用 HTTP。WebSocket 的特点包括：

1. **双向通信**：客户端和服务器都可以随时发送消息，而不必等待对方的请求。
2. **低延迟**：由于可以保持长连接，避免了重复建立连接的开销，因此 WebSocket 适用于需要快速响应的实时应用。
3. **适用场景**：通常用于需要频繁更新或交互的应用，如在线游戏、即时聊天、股票行情推送等。

WebSocket 连接建立的过程如下：

- 客户端发起一个 HTTP 请求，包含一个特殊的 `Upgrade` 头，用于请求升级到 WebSocket 协议。
- 服务器响应并同意升级，连接从 HTTP 协议升级为 WebSocket 协议。
- 一旦连接建立，双方可以通过这个连接进行双向通信，直到连接关闭。

### Server-Sent Events (SSE)

**Server-Sent Events (SSE)** 是一种单向通信协议，允许服务器向客户端推送实时更新。它基于 HTTP 协议，通过保持 HTTP 连接打开，服务器可以不断地发送更新数据。SSE 的特点包括：

1. **单向通信**：只有服务器可以向客户端发送消息，客户端无法通过同一连接向服务器发送消息。
2. **自动重连**：浏览器原生支持 SSE，并且在连接中断时会自动尝试重新连接。
3. **简单实现**：SSE 通过标准的 HTTP 请求来实现，因此在实现上相对简单，适合对实时性要求不高的应用。
4. **适用场景**：通常用于需要服务器推送更新的应用，如新闻推送、社交媒体更新、实时数据监控等。

SSE 连接建立的过程如下：

- 客户端发起一个普通的 HTTP 请求（通常是 `GET` 请求）。
- 服务器通过这个连接不断发送数据流，以特定的格式发送更新数据。
- 客户端接收到数据后处理相应的更新，连接保持打开状态，直到客户端或服务器关闭连接。

### 总结

| 特性       | WebSocket                           | SSE                                    |
| ---------- | ----------------------------------- | -------------------------------------- |
| 通信方向   | 双向                                | 单向（服务器到客户端）                 |
| 连接方式   | 通过 HTTP 升级为 WebSocket          | 通过 HTTP 长连接                       |
| 实现复杂度 | 较高                                | 较低                                   |
| 自动重连   | 需要手动实现                        | 浏览器原生支持                         |
| 应用场景   | 在线游戏、即时聊天、股票行情推送等  | 新闻推送、社交媒体更新、实时数据监控等 |
| 支持性     | 需要 WebSocket 支持的浏览器和服务器 | 浏览器广泛支持，服务器实现简单         |

根据具体的应用需求选择合适的技术，可以更有效地实现实时通信。

## 登录

### 单点登录(SSO)是什么

单点登录（SSO，Single Sign On），是在企业内部多个应用系统（如考勤系统、财务系统、人事系统等）场景下，用户只需要登录一次，就可以访问多个应用系统。

# 微前端

## [garfish](https://www.garfishjs.org/blog)

## [qiankun](https://qiankun.umijs.org/zh/guide)

## [@micro-zoe/micro-app](https://github.com/micro-zoe/micro-app/blob/HEAD/README.zh-cn.md)

# NPM

## 扁平依赖

npm 的`node_modules`目录采用扁平结构（flattened structure）主要是为了简化依赖管理和解决依赖冲突。以下是采用这种结构的具体原因和好处：

### 1. **减少重复依赖**

在扁平结构中，`node_modules`目录会尝试将所有依赖包尽可能放在顶层，这样如果多个包依赖同一个子包，可以避免重复安装。这种机制有效地减少了磁盘空间的占用和安装时间。

### 2. **简化模块解析**

在 Node.js 中，模块解析采用逐层向上查找的方式。如果每个依赖包都有自己的`node_modules`目录，查找某个模块时可能需要遍历多个层级的目录，增加了复杂性和查找时间。而扁平结构将大部分包放在顶层，模块解析的效率更高。

### 3. **解决依赖冲突**

扁平结构有助于解决依赖冲突。当多个包依赖不同版本的同一个包时，npm 会尝试将兼容的版本放在顶层，而将不兼容的版本放在各自包的`node_modules`目录中。这种方式减少了冲突，同时保证了每个包能够使用它所需的正确版本。

### 示例结构

假设一个项目的依赖关系如下：

- `project` 依赖于 `A` 和 `B`
- `A` 依赖于 `C@1.0.0`
- `B` 依赖于 `C@2.0.0`

在扁平结构下，`node_modules`目录可能如下所示：

```
project/
├── node_modules/
│   ├── A/
│   │   └── node_modules/
│   │       └── C/ (v1.0.0)
│   ├── B/
│   │   └── node_modules/
│   │       └── C/ (v2.0.0)
│   └── C/ (v2.0.0)  -> 尽可能提升版本一致的依赖到顶层
└── package.json
```

这种结构确保了每个包可以使用它所需的版本，同时避免了重复安装相同版本的包。

## peerDependencies

peerDependencies 主要用于声明库或插件所需要的特定版本的依赖，以确保兼容性和避免版本冲突。它不会自动安装这些依赖，而是由使用者来确保项目中存在满足要求的版本（npm 7+ 会自动安装）。这在开发需要与特定框架一起使用的共享库或插件时非常有用。

PeerDependencies are a way to specify that your package expects the consumer (the project that installs your package) to provide a specific dependency.

peerDependencies are packages your package relies on but expects the consumer to provide

## 版本语意化

在 `package.json` 文件中，包的版本范围是通过版本号前的特殊字符或符号来定义的。这些范围可以控制包的安装和更新。以下是一些常用的版本范围定义方式及其含义：

### 1. 精确版本

指定一个精确的版本号。

```json
"dependencies": {
  "example-package": "1.2.3"
}
```

这将安装 `1.2.3` 版本，且只安装这个版本。

### 2. 波浪号（Tilde, `~`）

允许更新到修订版本（补丁版本），但不会更新到下一个次要版本。

```json
"dependencies": {
  "example-package": "~1.2.3"
}
```

这将安装 `1.2.x` 版本，但不会安装 `1.3.0`。

### 3. 插入号（Caret, `^`）

允许更新到非重大版本，即次要版本和修订版本。

```json
"dependencies": {
  "example-package": "^1.2.3"
}
```

这将安装 `1.x.x` 版本，但不会安装 `2.0.0`。

### 4. 星号（Wildcard, `*`）

允许安装任何版本。

```json
"dependencies": {
  "example-package": "*"
}
```

这将安装最新的版本。

### 5. 范围

使用比较运算符定义一个版本范围。

```json
"dependencies": {
  "example-package": ">=1.2.3 <2.0.0"
}
```

这将安装 `1.2.3` 及以上，但低于 `2.0.0` 的版本。

### 6. X-Ranges

使用 `x` 或 `*` 来表示任意版本。

```json
"dependencies": {
  "example-package": "1.2.x"
}
```

这将安装 `1.2.x` 版本，但不会安装 `1.3.0`。

### 7. 逻辑运算符组合

组合多个逻辑运算符。

```json
"dependencies": {
  "example-package": ">=1.2.3 <1.3.0 || >=1.4.0 <2.0.0"
}
```

这将安装 `1.2.3` 至 `1.2.x` 或 `1.4.x` 版本，但不会安装 `1.3.0` 和 `2.0.0`。

### 8. URL 或文件路径

可以直接使用 URL 或本地文件路径。

```json
"dependencies": {
  "example-package": "http://example.com/example-package-1.2.3.tgz"
}
```

或者

```json
"dependencies": {
  "example-package": "file:../path/to/example-package"
}
```

### 总结

在 `package.json` 文件中，通过上述方式定义版本范围，可以灵活地控制包的安装和更新行为。这些版本范围定义方式有助于确保项目在特定的版本范围内运行，同时允许适当的更新以保持项目的稳定性和安全性。

## 幽灵依赖

在 npm（Node Package Manager）中，幽灵依赖（Phantom Dependency）是指项目中使用的依赖包并没有在项目的`package.json`文件中显式声明。这会导致一些问题，尤其是在不同开发环境或构建环境之间，可能导致项目无法正确构建或运行。具体来说，npm 中的幽灵依赖包括以下几种情况：

1. **未显式声明的依赖**：

   - 项目中的代码使用了某个 npm 包，但这个包并没有在`package.json`文件的`dependencies`或`devDependencies`中列出。这种情况可能发生在开发人员手动安装包时忘记使用`--save`或`--save-dev`标志。

2. **间接依赖**：
   - 项目依赖的一个包 A 依赖于另一个包 B，而项目并没有直接声明对包 B 的依赖。如果包 A 更新版本或去掉了对包 B 的依赖，项目可能会因此无法运行。

**示例说明**：

假设在一个 Node.js 项目中，`package.json`文件如下：

```json
{
  "name": "example-project",
  "version": "1.0.0",
  "dependencies": {
    "module-a": "^1.0.0"
  }
}
```

项目中的某个文件可能包含如下代码：

```javascript
const moduleA = require("module-a");
const moduleB = require("module-b"); // module-b 未在 package.json 中声明
```

在这个例子中，`module-b`是一个幽灵依赖，因为它没有在`package.json`中声明。假如`module-a`间接依赖于`module-b`，并且`module-a`的某个版本去除了对`module-b`的依赖，项目在重新安装依赖时将会因为找不到`module-b`而无法运行。

## pnpm

pnpm（Performant npm）是一种快速、高效的包管理工具，它通过独特的包存储和管理机制，帮助开发者更好地管理依赖关系。pnpm 可以有效避免幽灵依赖（Phantom Dependency）的问题，以下是 pnpm 如何做到这一点的具体方法和机制：

### pnpm 如何工作

pnpm 与传统的 npm 和 yarn 的主要区别在于其依赖管理和包存储机制。pnpm 使用硬链接和符号链接来管理包，这意味着每个包在磁盘上只会存储一份，所有项目共享这些包。这样不仅节省了磁盘空间，还提高了安装速度。

### 避免幽灵依赖的机制

1. **严格的依赖树结构**：

   - pnpm 创建一个严格的、非扁平的 `node_modules` 目录结构。这意味着每个包的依赖都会被安装在自己的 `node_modules` 目录中，而不会被提升到顶层。这有效防止了通过间接依赖访问未声明的依赖包。

   例如：

   ```plaintext
   node_modules/
   └── package-a/
       └── node_modules/
           └── package-b/
   ```

   在这种结构下，如果你的项目并没有显式声明依赖 `package-b`，那么直接 `require('package-b')` 是不可能的，因为 `package-b` 并不会出现在顶层 `node_modules` 中。

2. **严格的依赖解析**：

   - pnpm 严格遵守 `package.json` 文件中声明的依赖。只有明确声明的依赖包才会被安装到项目的 `node_modules` 目录中，这有效防止了幽灵依赖问题。

3. **重复利用包缓存**：

   - pnpm 会将下载的包缓存起来，并通过硬链接的方式复用这些包。这不仅提高了安装速度，还确保每个包版本的一致性，避免了因为网络波动或其他原因导致的包版本不一致问题。

### .pnpm 文件

在使用 pnpm 管理项目依赖时，`node_modules`目录下的`.pnpm`子目录扮演了一个重要的角色，它用于存储和管理实际的依赖包。具体来说，`.pnpm`目录有以下几个主要作用：

1. **存储实际的包文件**
   `.pnpm`目录中包含了项目依赖的所有实际包文件，而这些包文件是通过硬链接或符号链接的方式引用到项目的`node_modules`目录中。这样做的好处是节省了磁盘空间，因为每个包只存储一次，而不是每个项目都重复存储。

2. **管理包版本和缓存**
   pnpm 通过`.pnpm`目录管理不同版本的依赖包，确保每个项目都能使用正确版本的依赖包。这种版本管理机制有效避免了版本冲突和依赖地狱的问题。

3. **创建独立的依赖树**
   `.pnpm`目录帮助 pnpm 创建一个独立的、非扁平的依赖树结构。每个包的依赖都会被安装在自己的`node_modules`目录中，而不是提升到顶层。这种结构避免了通过间接依赖访问未声明的依赖包，从而防止了幽灵依赖问题。

4. **提高安装速度**
   由于`.pnpm`目录中存储了所有包的实际文件和版本信息，pnpm 在安装依赖时可以直接复用这些缓存文件，而不需要每次都从网络上下载。这大大提高了包安装的速度，尤其是在有多个项目共享相同依赖的情况下。

#### 示例结构

下面是一个示例项目的`node_modules`目录结构，展示了`.pnpm`目录的作用：

```
project/
├── node_modules/
│   ├── .pnpm/
│   │   ├── package-a@1.0.0/
│   │   ├── package-b@2.0.0/
│   │   └── ...
│   ├── package-a -> .pnpm/package-a@1.0.0/node_modules/package-a/
│   ├── package-b -> .pnpm/package-b@2.0.0/node_modules/package-b/
│   └── ...
└── package.json
```

在这个结构中，`package-a`和`package-b`是项目的依赖包，它们被存储在`.pnpm`目录中，并通过符号链接的方式引用到`node_modules`目录的顶层。

#### 优势总结

- **节省磁盘空间**：通过硬链接和符号链接机制，避免了重复存储相同版本的包。
- **提高安装速度**：利用缓存机制加快包的安装过程。
- **防止幽灵依赖**：严格的依赖树结构确保只能访问显式声明的依赖包。
- **简化依赖管理**：通过统一管理包版本和缓存，简化了依赖管理过程。

### 其他优势

- **快速**：pnpm 的独特存储机制使得包安装速度非常快，特别是在拥有大量依赖的项目中。
- **节省磁盘空间**：通过硬链接和符号链接，共享包存储，显著减少磁盘空间占用。
- **一致性**：pnpm 的严格依赖解析和缓存复用机制确保了每次安装的包版本一致，避免了“它在我机器上可以运行”的问题。

### 总结

pnpm 通过其独特的依赖管理和包存储机制，严格遵守`package.json`中的声明依赖，创建非扁平的`node_modules`目录结构，避免了通过间接依赖访问未声明依赖包的情况。这些特点使得 pnpm 在避免幽灵依赖方面非常有效，同时还提供了更高的安装速度和更少的磁盘空间占用，是管理依赖的一个优秀工具。

# HTML

## data

HTML 标签中的 data-属性用于存储自定义数据，这些数据可以在 JavaScript 中通过 DOM 访问和操作。它们可以用于在页面中存储任意类型的数据，例如字符串、数字、对象等，以便在需要时进行使用。这些数据属性可以帮助开发者在不使用全局变量的情况下，将数据与特定的 HTML 元素关联起来，从而实现更加模块化和可维护的代码。

## script

`<script>` 标签在 HTML 中用于嵌入或引用 JavaScript 代码。它有多种属性，用于控制脚本的加载和执行方式。以下是 `<script>` 标签的常用属性及其作用：

### 常用属性

1. **src**

   - **描述**: 指定外部脚本文件的 URL。
   - **用法**: `<script src="path/to/script.js"></script>`
   - **注意**: 当使用 `src` 属性时，`<script>` 标签的内容会被忽略。

2. **type**

   - **描述**: 指定脚本的 MIME 类型。默认是 `text/javascript`。
   - **用法**: `<script type="text/javascript">/* JavaScript code */</script>`
   - **注意**: 对于现代浏览器，可以省略 `type` 属性，因为 `text/javascript` 是默认值。

3. **async**

   - **描述**: 指示脚本应当异步加载并执行。
   - **用法**: `<script src="path/to/script.js" async></script>`
   - **注意**: 适用于外部脚本，脚本的执行顺序不保证。

4. **defer**

   - **描述**: 指示脚本应当在文档解析完成后执行。
   - **用法**: `<script src="path/to/script.js" defer></script>`
   - **注意**: 适用于外部脚本，脚本的执行顺序按照在文档中出现的顺序。

5. **crossorigin**

   - **描述**: 配置跨源请求的 CORS 设置。
   - **用法**: `<script src="path/to/script.js" crossorigin="anonymous"></script>`
   - **选项**:
     - `anonymous`: 脚本将不带凭据请求。
     - `use-credentials`: 脚本将带凭据请求。

6. **integrity**

   - **描述**: 提供一个基于内容的哈希值，用于验证加载的脚本是否未被篡改。
   - **用法**: `<script src="path/to/script.js" integrity="sha384-..."></script>`
   - **注意**: 需配合 `crossorigin` 属性使用。

7. **nomodule**

   - **描述**: 指示该脚本在支持 ES6 模块的浏览器中不应被执行。
   - **用法**: `<script nomodule src="path/to/script.js"></script>`
   - **注意**: 通常用于向后兼容旧版浏览器。

8. **referrerpolicy**
   - **描述**: 设置请求的 Referrer Policy。
   - **用法**: `<script src="path/to/script.js" referrerpolicy="no-referrer"></script>`

### 示例

以下是一些示例，展示了如何使用这些属性：

```html
<!-- 外部脚本，默认类型 text/javascript -->
<script src="main.js"></script>

<!-- 内联脚本 -->
<script>
  console.log("Hello, world!");
</script>

<!-- 异步加载外部脚本 -->
<script src="async-script.js" async></script>

<!-- 延迟执行外部脚本 -->
<script src="defer-script.js" defer></script>

<!-- 跨域请求外部脚本，且验证其完整性 -->
<script
  src="https://example.com/script.js"
  crossorigin="anonymous"
  integrity="sha384-..."
></script>

<!-- 仅在不支持 ES6 模块的浏览器中执行 -->
<script nomodule src="fallback-script.js"></script>
```

通过合理地使用这些属性，可以更好地控制 JavaScript 脚本的加载和执行，优化页面性能和用户体验。

## link 标签

`<link>` 标签在 HTML 中主要用于定义文档与外部资源的关系，最常见的是链接 CSS 样式表。它也可以用于预加载、预取等资源管理。以下是 `<link>` 标签的常用属性及其作用：

### 常用属性

1. **rel**

   - **描述**: 定义链接与当前文档之间的关系。
   - **常见值**:
     - `stylesheet`: 链接到一个外部样式表。
     - `preload`: 提前加载资源（如脚本、样式、字体等）。
     - `prefetch`: 低优先级地获取将来可能用到的资源。
     - `dns-prefetch`: 预先解析域名。
     - `preconnect`: 提前建立网络连接。
     - `canonical`: 指定文档的规范 URL。
     - `icon`: 链接到网站图标（favicon）。

2. **href**

   - **描述**: 定义被链接资源的 URL。
   - **用法**: `<link href="style.css" rel="stylesheet">`

3. **type**

   - **描述**: 定义被链接资源的 MIME 类型。
   - **用法**: `<link href="style.css" rel="stylesheet" type="text/css">`
   - **注意**: 对于 CSS 样式表，可以省略，因为 `text/css` 是默认值。

4. **media**

   - **描述**: 指定被链接资源适用的媒体类型。
   - **用法**: `<link href="print.css" rel="stylesheet" media="print">`
   - **常见值**: `all`, `screen`, `print`, `speech` 等。

5. **hreflang**

   - **描述**: 定义被链接资源的语言。
   - **用法**: `<link href="example.fr.html" rel="alternate" hreflang="fr">`

6. **sizes**

   - **描述**: 用于定义图标（如 favicon）的尺寸。
   - **用法**: `<link href="favicon.png" rel="icon" sizes="32x32">`

7. **title**

   - **描述**: 为链接的资源提供一个标题。
   - **用法**: `<link href="style.css" rel="stylesheet" title="Default Style">`

8. **as**

   - **描述**: 用于 `rel="preload"` 和 `rel="prefetch"`，定义被链接资源的类型。
   - **用法**: `<link href="main.js" rel="preload" as="script">`

9. **crossorigin**

   - **描述**: 配置跨源请求的 CORS 设置。
   - **用法**: `<link href="https://example.com/style.css" rel="stylesheet" crossorigin="anonymous">`
   - **选项**:
     - `anonymous`: 不带凭据请求。
     - `use-credentials`: 带凭据请求。

10. **integrity**

    - **描述**: 提供一个基于内容的哈希值，用于验证资源的完整性。
    - **用法**: `<link href="style.css" rel="stylesheet" integrity="sha384-...">`

11. **disabled**
    - **描述**: 禁用当前样式表。
    - **用法**: `<link href="style.css" rel="stylesheet" disabled>`

### 示例

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Link Tag Attributes Example</title>

    <!-- 链接到一个外部样式表 -->
    <link href="style.css" rel="stylesheet" />

    <!-- 预加载脚本 -->
    <link rel="preload" href="script.js" as="script" />

    <!-- 预取资源 -->
    <link rel="prefetch" href="future-resource.js" />

    <!-- DNS 预解析 -->
    <link rel="dns-prefetch" href="//example.com" />

    <!-- 预连接 -->
    <link rel="preconnect" href="//example.com" />

    <!-- 规范 URL -->
    <link rel="canonical" href="https://example.com/page.html" />

    <!-- 网站图标 -->
    <link href="favicon.ico" rel="icon" sizes="32x32" />

    <!-- 媒体查询 -->
    <link href="print.css" rel="stylesheet" media="print" />

    <!-- 指定语言的替代资源 -->
    <link href="example.fr.html" rel="alternate" hreflang="fr" />

    <!-- 配置跨源请求 -->
    <link
      href="https://example.com/style.css"
      rel="stylesheet"
      crossorigin="anonymous"
    />

    <!-- 完整性校验 -->
    <link href="style.css" rel="stylesheet" integrity="sha384-..." />
  </head>
  <body>
    <h1>Link Tag Attributes Example</h1>
  </body>
</html>
```

通过合理地使用这些属性，可以有效地管理和优化网页资源的加载和使用，提升用户体验。

# 浏览器

## 浏览器进程

浏览器是一个复杂的软件系统，它使用多个进程来管理不同的任务，以提高性能和安全性。以下是对浏览器进程的详细介绍，包括它们的类型和各自的作用。

### 1. 浏览器进程（Browser Process）

**作用**:

- 负责管理和协调其他进程的工作。
- 处理用户界面、导航、浏览器功能（如书签、历史记录等）。
- 管理网络请求（包括缓存、cookie、HTTP/HTTPS 协议等）。
- 处理进程间通信和资源分配。

**特点**:

- 每个浏览器实例通常有一个浏览器进程。
- 是浏览器的主进程，启动和关闭其他进程。

### 2. 渲染进程（Renderer Process）

**作用**:

- 负责将 HTML、CSS 和 JavaScript 转换为用户可见的网页。
- 处理页面布局、绘制、脚本执行和用户交互。

**特点**:

- 通常每个标签页（Tab）对应一个独立的渲染进程，但也有可能多个标签页共享一个渲染进程（例如同一站点的多个标签页）。
- 运行在沙箱环境中，以增强安全性，防止恶意网页对系统造成损害。

### 3. 插件进程（Plugin Process）

**作用**:

- 用于加载和执行浏览器插件，如 Flash、PDF 阅读器等。

**特点**:

- 每个插件有一个或多个独立的进程。
- 通过进程隔离，提高稳定性和安全性，防止插件崩溃影响整个浏览器。

### 4. GPU 进程（GPU Process）

**作用**:

- 专门用于处理图形渲染任务。
- 利用 GPU 的加速能力，提高图形处理性能，如 3D 渲染、视频解码和硬件加速的绘制任务。

**特点**:

- 通常是一个独立的进程，与渲染进程协同工作。
- 提高网页的渲染性能，减轻 CPU 负担。

### 5. 网络进程（Network Process）

**作用**:

- 负责处理所有的网络请求，包括 HTTP/HTTPS 请求、WebSocket 连接等。

**特点**:

- 管理网络协议的实现和数据传输。
- 提供共享缓存机制，提高网络请求的效率。

### 6. 实例说明

以 Chrome 浏览器为例，Chrome 采用多进程架构，每个标签页、插件、GPU 都运行在独立的进程中。这种架构增强了浏览器的稳定性、安全性和性能。

### 示例架构

假设用户打开了三个标签页，并且每个标签页加载了不同的网站，浏览器可能会创建如下的进程结构：

1. **浏览器进程**

   - 负责管理和协调所有其他进程。

2. **网络进程**

   - 负责处理所有网络请求。

3. **GPU 进程**

   - 负责处理所有图形渲染任务。

4. **渲染进程 1**

   - 负责标签页 1 的内容渲染。

5. **渲染进程 2**

   - 负责标签页 2 的内容渲染。

6. **渲染进程 3**

   - 负责标签页 3 的内容渲染。

7. **插件进程**
   - 负责执行某个插件（如 Flash）的任务。

### 进程间通信

浏览器进程之间通过进程间通信（IPC）机制进行通信。浏览器进程（Browser Process）会管理和调度其他进程之间的通信。例如，当用户在一个标签页中点击一个链接时：

1. 浏览器进程通知网络进程发起网络请求。
2. 网络进程获取响应后，通知对应的渲染进程。
3. 渲染进程将响应内容解析并渲染为用户可见的页面。

### 优势

1. **稳定性**:

   - 各个标签页、插件、GPU 独立运行，一个进程崩溃不会影响整个浏览器。

2. **安全性**:

   - 通过沙箱技术和进程隔离，限制恶意网页或插件的访问权限。

3. **性能**:
   - 利用多核 CPU 和 GPU 提高浏览器的响应速度和图形处理能力。

## 网页请求

从输入 URL 到浏览器展示网页的整个过程涉及多个步骤和技术，涵盖了网络、浏览器渲染、HTTP 请求等多个领域。以下是详细的分步骤介绍：

### 1. 用户输入 URL

用户在浏览器的地址栏中输入 URL（如 `http://example.com`）并按下回车键。

### 2. DNS 解析

浏览器首先需要将域名转换为 IP 地址，这个过程称为 DNS 解析（Domain Name System）。

- 浏览器检查本地 DNS 缓存是否有该域名的 IP 地址。
- 如果没有，浏览器会向 DNS 服务器发送查询请求。
- DNS 服务器返回域名对应的 IP 地址。

### 3. 建立 TCP 连接

有了 IP 地址后，浏览器通过 TCP/IP 协议与目标服务器建立连接。

- 浏览器与服务器通过三次握手建立 TCP 连接：
  1. 客户端发送 SYN（同步）包给服务器。
  2. 服务器回应 SYN-ACK（同步-确认）包。
  3. 客户端发送 ACK（确认）包，连接建立。

### 4. 发送 HTTP 请求

TCP 连接建立后，浏览器向服务器发送 HTTP 请求。

- 浏览器构建 HTTP 请求报文，包含方法（GET）、路径、协议版本（HTTP/1.1）、请求头（如 User-Agent, Accept-Language）等信息。
- 请求主体在 GET 请求中通常为空。

示例请求：

```http
GET / HTTP/1.1
Host: example.com
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8
Accept-Language: en-US,en;q=0.5
Connection: keep-alive
```

### 5. 服务器处理请求

服务器接收到请求后，处理请求并生成响应。

- 服务器根据请求路径找到对应的资源或执行相应的逻辑（如调用数据库、运行后台程序）。
- 服务器构建 HTTP 响应报文，包含状态码（200 OK）、响应头（如 Content-Type, Content-Length）和响应主体（HTML 文档）。

示例响应：

```http
HTTP/1.1 200 OK
Content-Type: text/html; charset=UTF-8
Content-Length: 342

<!DOCTYPE html>
<html>
<head>
  <title>Example Domain</title>
</head>
<body>
  <h1>Example Domain</h1>
  <p>This domain is for use in illustrative examples in documents.</p>
</body>
</html>
```

### 6. 浏览器接收响应

浏览器接收到服务器的响应后，开始解析和渲染网页。

#### 6.1 解析 HTML

- 浏览器的 HTML 解析器将 HTML 文档解析成 DOM（Document Object Model）树。

#### 6.2 解析 CSS

- 浏览器解析 CSS 文件和内嵌的 CSS 样式，生成 CSSOM（CSS Object Model）树。

#### 6.3 构建渲染树

- 浏览器将 DOM 树和 CSSOM 树结合，构建渲染树。

#### 6.4 布局（Layout）

- 浏览器计算每个元素在屏幕上的位置和大小（布局阶段，也称为回流）。

#### 6.5 绘制（Painting）

- 浏览器将渲染树中的每个节点绘制到屏幕上（绘制阶段）。

### 7. 执行 JavaScript

- 浏览器的 JavaScript 引擎（如 V8、SpiderMonkey）解析和执行 JavaScript 代码。
- JavaScript 代码可能会修改 DOM 或 CSSOM，触发重新布局和重绘。

### 8. 处理资源请求

- 如果 HTML 中引用了外部资源（如 CSS、JavaScript 文件、图像），浏览器会发起额外的 HTTP 请求获取这些资源。
- 浏览器使用缓存机制（如强缓存和协商缓存）来优化资源加载速度。

### 9. 安全检查

- 浏览器执行各种安全检查，如同源策略（SOP）、内容安全策略（CSP）、混合内容检查（HTTPS 页面的 HTTP 资源）等。

### 10. 用户交互

- 用户可以与页面进行交互，浏览器处理用户事件（如点击、输入、滚动）并作出相应响应。

### 总结

从用户输入 URL 到网页展示，涉及 DNS 解析、建立 TCP 连接、发送 HTTP 请求、服务器处理请求、浏览器解析和渲染页面，以及执行 JavaScript 和处理资源请求。这一过程包含许多复杂的步骤和机制，确保用户能够快速、准确地访问所请求的网页。

## 解析 HTMl

浏览器解析 HTML 是一个复杂而关键的过程，涉及将 HTML 文档转换为用户可以在屏幕上看到和交互的内容。这个过程包括以下主要步骤：

### 1. 构建 DOM 树

当浏览器接收到 HTML 文档后，首先会解析它并构建 DOM（Document Object Model）树。DOM 树是 HTML 文档的内存表示，它由节点和对象组成，每个节点代表文档的一部分（如元素、属性、文本）。

- **解析器读取 HTML 标记**：
  - 浏览器从上到下按顺序读取 HTML 标记。
  - 每遇到一个标记，解析器就会创建一个对应的节点并将其添加到 DOM 树中。

### 2. 处理 CSS

在构建 DOM 树的同时，浏览器也会解析 CSS（包括外部样式表、内联样式和嵌入样式），并生成 CSSOM（CSS Object Model）树。

- **解析 CSS**：

  - 浏览器读取并解析所有的 CSS 文件和内嵌的 CSS。
  - 生成 CSSOM 树，它描述了样式信息和规则。

- 注：
  - 在 CSS 文件加载和解析完成之前，浏览器会暂停渲染，继续解析 HTML 但不会进行绘制。
  - 当浏览器遇到 `<script>` 标签且未使用 async 或 defer 属性时，会暂停 DOM 树和 CSSOM 树的构建，直到脚本执行完毕。这是因为脚本可能会修改 DOM 和 CSS。

### 3. 构建渲染树

浏览器将 DOM 树和 CSSOM 树结合起来，生成渲染树。这棵树包含了所有需要显示的内容及其样式信息，但不包含那些被隐藏的元素（如 `display: none`）。

- **创建渲染树**：
  - 浏览器遍历 DOM 树中的每个可见节点，生成相应的渲染对象。
  - 每个渲染对象对应一个或多个盒模型，描述了元素的几何形状和样式。

### 4. 布局（Layout）

也称为回流（Reflow），浏览器计算每个渲染对象在屏幕上的位置和尺寸。布局过程从渲染树的根节点开始，根据节点的几何属性（如宽度、高度、内边距、外边距等）逐层计算每个节点的位置和大小。

- **计算布局**：
  - 浏览器从根节点开始，按照 CSS 盒模型和布局规则，计算每个节点的确切位置和尺寸。
  - 结果是一个包含所有渲染对象的几何信息的树。

### 5. 绘制（Painting）

绘制阶段是将渲染树中的每个节点绘制到屏幕上。浏览器会遍历渲染树，并将每个节点的内容按照计算好的布局绘制到屏幕上的相应位置。

- **分层绘制**：

  - 复杂的页面可能会分成多个层，每个层包含一部分内容（如背景、文字、图片）。
  - 浏览器将每个层绘制到一个栅格（raster）中。

- **组合层**：
  - 将所有层组合在一起，生成最终的屏幕图像。

### 6. 执行 JavaScript

在 HTML 解析过程中，如果遇到 `<script>` 标签，浏览器会暂停 HTML 的解析并执行脚本。这是因为脚本可能会修改 DOM 结构。

- **同步脚本**：
  - 阻塞 HTML 解析，直到脚本执行完毕。
  - 如果脚本包含 `defer` 或 `async` 属性，处理方式会有所不同：
    - `defer` 脚本会在 HTML 完全解析完后执行。
    - `async` 脚本会异步加载并立即执行，不阻塞解析。

### 7. 处理资源请求

在解析 HTML 时，浏览器会遇到各种外部资源（如图像、样式表、JavaScript 文件），需要发起 HTTP 请求来获取这些资源。

- **资源加载**：
  - 浏览器并行加载资源，并根据资源类型进行相应处理。
  - 加载完成后，继续解析和处理 HTML 文档。

### 8. 触发重新渲染

JavaScript 执行、样式表加载完成、用户交互等事件都可能触发 DOM 和 CSSOM 的变化，进而导致重新计算布局和绘制。

- **重新布局和重绘**：
  - 修改 DOM 结构或样式会导致回流和重绘。
  - 浏览器尽量优化这些过程，以减少性能开销。

### 流程图示例

```plaintext
HTML 解析 -> 构建 DOM 树
            -> 处理 CSS -> 构建 CSSOM 树
                              -> 合并 DOM 和 CSSOM 树 -> 构建渲染树
                                                             -> 布局计算 -> 绘制到屏幕
```

### 总结

从输入 URL 到最终展示网页，浏览器解析 HTML 的过程包括构建 DOM 树、处理 CSS、生成渲染树、布局计算和绘制到屏幕。同时，JavaScript 执行和资源加载也在这个过程中起到了重要作用。理解这些步骤有助于开发者优化网页性能和用户体验。

## [垃圾回收](https://medium.com/@mmoshikoo/garbage-collector-in-v8-engine-1c582399837)

### V8 堆内存的划分

V8 堆内存分为两个主要部分：

- **年轻代（young generation）**：这是存放新创建的对象的区域。
- **老年代（old generation）**：这是存放生命周期较长的对象的区域。

#### 2. 年轻代的进一步划分

年轻代又进一步划分为两个子代：

- **Nursery（新生代）**：这是最初存放新创建对象的区域。
- **Intermediate（中生代）**：这是在新生代和老年代之间的过渡区域。

#### 3. 对象的生命周期管理

对象在 V8 中的生命周期可以大致分为以下几个阶段：

- **新对象创建**：当一个对象首次创建时，它会被放置在新生代（nursery）中。

- **第一次垃圾回收**：垃圾回收器会定期扫描新生代，并清理不再使用的对象。如果一个对象在这次回收中存活下来（即仍然被引用），它会被移动到中生代（intermediate）。

- **第二次垃圾回收**：在中生代中的对象将再次被垃圾回收器扫描。如果它们在这次回收中再次存活下来，它们会被移动到老年代（old generation）。

#### 具体流程

1. **对象创建**：

   - 当你在 JavaScript 中创建一个对象时，例如 `let obj = { name: "example" };`，这个对象最初会被放在年轻代的 nursery 区域。

2. **第一次垃圾回收**：

   - 垃圾回收器扫描 nursery 区域，清理不再使用的对象。幸存下来的对象会被移动到 intermediate 区域。

3. **第二次垃圾回收**：
   - 垃圾回收器扫描 intermediate 区域，清理不再使用的对象。再次幸存下来的对象会被移动到老年代。

#### 总结

通过这种方式，V8 能够高效地管理内存。大部分短生命周期的对象会在 nursery 区域被快速回收，而那些生命周期较长的对象会逐渐移动到老年代，从而减少垃圾回收对这些对象的影响。这种分代垃圾回收机制提高了内存管理的效率和性能。

### 流程

- Marking
- Sweeping
- compact

![流程](./gc.png "可选标题")

## 浏览器进程

## Cookie

Cookies 是浏览器用于在客户端和服务器之间存储和传递小量数据的机制。它们在 Web 应用中有多种重要作用，并且可以存放各种信息。以下是详细介绍：

### 1. Cookie 的作用

- **会话管理**：

  - **用户登录会话**：存储用户的会话 ID，以便在用户关闭浏览器后再次打开时保持登录状态。
  - **购物车**：存储用户在电商网站上的购物车信息。

- **个性化设置**：

  - **用户偏好**：存储用户的语言选择、主题颜色等个性化设置。
  - **站点设置**：记录用户的站点配置，比如布局选择、显示选项等。

- **跟踪和分析**：
  - **跟踪用户行为**：存储用户在站点上的行为数据，用于分析和优化用户体验。
  - **广告定向**：用于广告网络跟踪用户在不同网站上的行为，提供个性化广告。

### 2. Cookie 一般存放的信息

- **会话 ID**：用于识别用户会话的唯一标识符。
- **用户偏好**：如语言设置、主题选择等。
- **认证令牌**：用于验证用户身份的加密令牌。
- **跟踪信息**：用户行为数据、访问统计等。
- **临时数据**：购物车内容、未提交的表单数据等。

### 3. 如何保证 Cookie 安全

为了确保 Cookie 安全，防止潜在的安全威胁，如跨站脚本攻击（XSS）、跨站请求伪造（CSRF）等，可以采取以下措施：

#### 3.1. 设置 HttpOnly 属性

- **HttpOnly**：设置 `HttpOnly` 属性可以防止客户端脚本（如 JavaScript）访问 Cookie，从而减少 XSS 攻击的风险。

```http
Set-Cookie: sessionId=abc123; HttpOnly
```

#### 3.2. 设置 Secure 属性

- **Secure**：设置 `Secure` 属性可以确保 Cookie 只能通过 HTTPS 连接传输，防止在传输过程中被窃取。

```http
Set-Cookie: sessionId=abc123; Secure
```

#### 3.3. 设置 SameSite 属性

- **SameSite**：设置 `SameSite` 属性可以防止 CSRF 攻击。该属性有三个值：
  - `Strict`：完全禁止第三方网站请求时发送 Cookie。
  - `Lax`：允许部分第三方请求发送 Cookie（例如通过链接打开新页面）。
  - `None`：允许所有第三方请求发送 Cookie，但需要配合 `Secure` 属性使用。

```http
Set-Cookie: sessionId=abc123; SameSite=Strict
```

#### 3.4. 使用加密和签名

- **加密敏感信息**：将敏感信息加密后存储在 Cookie 中，即使 Cookie 被截获，也无法直接读取其中的内容。
- **签名**：对 Cookie 内容进行签名，以防止篡改。

#### 3.5. 控制 Cookie 的生存期

- **Expires 和 Max-Age**：设置合理的过期时间，确保 Cookie 不会长时间存在。

```http
Set-Cookie: sessionId=abc123; Max-Age=3600
```

#### 3.6. 限制路径和域

- **Path**：限制 Cookie 的路径，使其只在特定路径下可用。

```http
Set-Cookie: sessionId=abc123; Path=/account
```

- **Domain**：限制 Cookie 的域，使其只在特定域名下可用。

```http
Set-Cookie: sessionId=abc123; Domain=example.com
```

### 总结

Cookie 在 Web 应用中有多种重要作用，包括会话管理、个性化设置、跟踪和分析。为了确保 Cookie 的安全性，开发者应合理设置 `HttpOnly`、`Secure`、`SameSite` 等属性，使用加密和签名技术，并控制 Cookie 的生存期和作用范围。通过这些措施，可以有效防止潜在的安全威胁，保护用户数据。

## 网络攻击

网络攻击种类繁多，针对不同的目标和漏洞展开。以下是一些常见的网络攻击类型及其详细介绍：

### 1. 钓鱼攻击（Phishing）

**简介**：

- 攻击者伪装成可信实体，通过电子邮件、短信或其他方式诱导受害者透露敏感信息（如用户名、密码、信用卡信息）。

**特征**：

- 常包含伪造的链接和恶意附件。
- 信息通常看似来自合法机构，如银行、社交媒体平台等。

**防御措施**：

- 提高用户安全意识，避免点击可疑链接。
- 使用反钓鱼工具和过滤器。
- 启用双因素认证（2FA）。

### 2. 分布式拒绝服务攻击（DDoS Attack）

**简介**：

- 攻击者使用多个受感染的设备（僵尸网络）向目标服务器发送大量请求，导致其无法正常服务。

**特征**：

- 流量剧增，服务器过载，服务中断。

**防御措施**：

- 使用内容分发网络（CDN）和防火墙。
- 部署 DDoS 防护服务。
- 监控网络流量，及时发现和应对异常流量。

### 3. 中间人攻击（Man-in-the-Middle Attack）

**简介**：

- 攻击者在通信双方之间窃听或篡改通信内容，以获取敏感信息或操控通信过程。

**特征**：

- 通信看似正常，但攻击者能够监听或篡改数据。

**防御措施**：

- 使用加密协议（如 HTTPS、TLS）。
- 避免使用公共 Wi-Fi 或使用 VPN 保护通信。
- 启用强身份验证机制。

### 4. SQL 注入攻击（SQL Injection）

**简介**：

- 攻击者通过输入恶意 SQL 代码，操控数据库查询，进而访问、修改或删除数据库中的数据。

**特征**：

- 通过网页表单或 URL 参数输入恶意代码。

**防御措施**：

- 使用预处理语句和参数化查询。
- 验证和清理用户输入。
- 限制数据库用户权限。

### 5. 跨站脚本攻击（XSS Attack）

**简介**：

- 攻击者在网页中注入恶意脚本，浏览者执行这些脚本后，攻击者可以窃取会话信息、劫持用户账户等。

**特征**：

- 常通过输入表单、URL 参数、评论区等注入恶意脚本。

**防御措施**：

- 对用户输入进行编码和过滤。
- 使用内容安全策略（CSP）。
- 验证和转义输出数据。

### 6. 跨站请求伪造（CSRF Attack）

**简介**：

- 攻击者诱导已认证用户在未经用户同意的情况下执行不希望的操作。

**特征**：

- 用户在已认证状态下访问攻击者网站，触发恶意请求。

**防御措施**：

- 使用 CSRF 令牌。
- 设置 SameSite Cookie 属性。
- 验证请求来源（Referer/Origin）。

### 总结

网络攻击形式多样，威胁复杂。了解这些攻击类型及其特征和防御措施，能够帮助用户和组织更好地保护自己的信息和系统安全。通过综合应用多种安全技术和策略，可以有效减少被攻击的风险，提升整体安全水平。

# 工程化

## webpack

## vite [->](../build/vite.md)

主要由两部分组成：

- 一个开发服务器，它基于 原生 ES 模块 提供了 丰富的内建功能，如速度快到惊人的 模块热更新（HMR）。
- 一套构建指令，它使用 Rollup 打包你的代码，并且它是预配置的，可输出用于生产环境的高度优化过的静态资源。

# React

## 父子组件通信

- 通过 Ref 获取子组件的状态`forwardRef + useImperativeHandle(ref, createHandle, dependencies?)`

## Fiber

React Fiber 是 React 16 及以后的版本中引入的一种新的协调引擎架构。它是对 React 旧有架构的重写，旨在解决复杂应用中的性能问题，提高对异步渲染任务的支持。下面是对 React Fiber 架构的详细解释：

### 背景

在旧的 React 架构中，更新是同步进行的，这意味着一旦开始更新，React 会一直进行更新直到完成。这种同步更新方式在处理大型复杂应用时，可能会导致浏览器的主线程长时间被阻塞，影响用户体验。

### 核心概念

React Fiber 通过将渲染工作分解成多个小任务，并将这些小任务分配到多个帧中进行处理，从而实现异步渲染和任务优先级管理。以下是 Fiber 架构的一些核心概念：

1. **Fiber 节点**：
   Fiber 节点是 React 应用中每个组件对应的轻量级对象，包含了组件的类型、状态、props 和一些指向子节点、兄弟节点、父节点的指针。

2. **双缓冲技术**：
   Fiber 使用双缓冲技术，分为`current`树和`workInProgress`树。`current`树表示当前屏幕上显示的 UI，而`workInProgress`树是正在计算的下一帧 UI。

3. **时间切片**：
   Fiber 将渲染工作分成多个小任务，每个任务占用少量时间，任务之间可以插入其他高优先级任务，从而避免长时间的主线程阻塞。

4. **优先级调度**：
   Fiber 为每个更新分配优先级，根据优先级决定更新的顺序。高优先级任务（如用户输入）会优先处理，低优先级任务（如动画、数据更新）会被延后处理。

### 工作流程

Fiber 架构的工作流程分为两部分：**Reconciliation（协调）** 和 **Commit（提交）**。

1. **Reconciliation（协调）**：

   - React 会根据组件树创建一棵 Fiber 树。
   - Fiber 树的创建过程是可中断的，React 会在合适的时候中断并让出控制权，以便处理高优先级任务。
   - 在这个阶段，React 会计算哪些部分需要更新、添加或删除，但不会直接更新 DOM。

2. **Commit（提交）**：
   - 一旦协调阶段完成，React 会进入提交阶段。
   - 提交阶段是同步的，这意味着一旦开始就不会中断。
   - 在这个阶段，React 会将变化应用到 DOM 上，更新屏幕上的 UI。

### 优势

1. **更细粒度的任务调度**：Fiber 允许 React 将更新任务分解为更小的单元，可以更好地响应用户交互和动画。
2. **异步渲染**：通过将渲染工作分割成小任务并分配到多个帧中进行处理，Fiber 能够实现异步渲染，提高性能。
3. **优先级处理**：Fiber 为不同类型的任务分配优先级，确保高优先级任务（如用户输入）能被及时响应。
4. **更好的错误处理**：Fiber 引入了错误边界（Error Boundaries），使得在渲染过程中出现错误时，能够更优雅地进行错误处理，而不会导致整个应用崩溃。

### 总结

React Fiber 是为了提高 React 应用的性能和响应能力而设计的全新架构。通过将渲染工作分解成更小的任务，支持异步渲染和任务优先级管理，Fiber 架构显著改善了复杂应用中的用户体验。它为 React 提供了更灵活和高效的更新机制，使得开发者可以构建更加流畅和响应迅速的用户界面。

## Diff

React 的 diff 算法是 React 用于高效地更新 DOM 的关键技术。这个算法的核心思想是通过比较虚拟 DOM（virtual DOM）的变化来最小化实际 DOM 操作，从而提高性能。React 的 diff 算法主要基于以下原则和策略：

### 核心原则

1. **最小化更新范围**：

   - React 会尽量减少对实际 DOM 的操作，只更新发生变化的部分，从而提高性能。

2. **分层比较**：
   - React 会将整个 UI 树分层比较，不同层次的节点之间的比较相对独立，减少了整体比较的复杂度。

### 主要策略

#### 1. 同层节点比较

React 会假设在不同层级上的节点不会发生移动。换句话说，它只会比较同一层级上的节点，而不会跨层级进行比较。这个假设大大简化了 diff 的复杂度。

```javascript
// 样例结构
<div>
  <A />
  <B />
  <C />
</div>
```

- 假设 `B` 和 `C` 的位置发生了变化，那么 React 只会在同一层级上比较它们，而不会考虑 `A` 和 `B`、`A` 和 `C` 的位置关系。

#### 2. 节点的唯一标识（Key）

在列表中，React 使用 `key` 属性来标识每一个节点。通过 `key`，React 能够高效地识别哪些节点发生了变化、添加或删除。

```javascript
// 带有 key 的列表项
<ul>
  {items.map((item) => (
    <li key={item.id}>{item.name}</li>
  ))}
</ul>
```

- `key` 的使用使得 React 可以快速定位哪些节点是新增的，哪些是删除的，哪些是重新排序的。

#### 3. 节点类型的比较

- **不同类型节点**：

  - 如果两个节点类型不同（例如一个是 `<div>`，另一个是 `<span>`），React 会直接销毁旧节点并创建新节点，而不会尝试复用旧节点。

- **相同类型节点**：
  - 如果两个节点类型相同，React 会继续比较它们的属性和子节点。

#### 4. 属性和子节点的比较

- **属性比较**：

  - 对于同类型的节点，React 会逐一比较它们的属性，并更新那些发生变化的属性。

- **子节点比较**：
  - React 会递归地进行子节点的比较，应用同样的 diff 算法。

### Diff 算法的复杂度

React 的 diff 算法并不是一个全局最优算法，而是一个启发式算法，其复杂度为 \(O(n)\)，其中 \(n\) 是节点树的大小。这种复杂度保证了 React 的高性能，使得它能够在实际应用中快速响应 UI 的变化。

### Diff 过程

#### 单一节点

1. key 对比
2. type 对比

#### 多节点

1. 第一轮遍历
   比较 newChildren[i]与 oldFiber：

   - key 相同 type 不同，标记为 deletion
   - key 不同，跳出本轮循环

2. 第二轮遍历
   - newChildren 与 oldFiber 同时遍历完：更新节点
   - newChildren 没遍历完，oldFiber 遍历完：田间节点
   - newChildren 遍历完，oldFiber 没遍历完：删除节点
   - newChildren 与 oldFiber 都没遍历完：这意味着有节点在这次更新中改变了位置：
     - 对比 children 中，当前节点在 oldFiber 中的位置(oldIndex )与前一个节点在 oldFiber 中的位置(lastPlacedIndex)，如果 oldIndex < lastPlacedIndex，说明在旧的 FiberList 中，当前节点应该后移。

### 总结

React 的 diff 算法通过分层比较、利用 `key` 属性进行高效定位、以及对同类型节点和不同类型节点的不同处理策略，实现了高性能的 UI 更新。这种启发式算法大大简化了复杂度，使得 React 能够快速响应和渲染 UI 变化，在实际应用中表现出色。

## Hooks

### useLayoutEffect

`useLayoutEffect` 是 React 中的一个 Hook，主要用于在 React 渲染阶段之后但在浏览器更新屏幕之前同步执行某些副作用操作。它与 `useEffect` 类似，但在调用时间点和用途上有所不同。

#### 主要特点

1. **同步执行**：与 `useEffect` 异步执行不同，`useLayoutEffect` 是同步执行的，这意味着它会在所有 DOM 变更后立即执行，而不是等到浏览器完成绘制之后再执行。

2. **阻塞浏览器绘制**：由于 `useLayoutEffect` 是同步执行的，它会阻塞浏览器的绘制。也就是说，在 `useLayoutEffect` 回调函数完成执行之前，浏览器不会更新屏幕。这使得它非常适合那些需要读取布局信息或直接进行 DOM 操作的场景。

3. **依赖数组**：`useLayoutEffect` 的依赖数组用法与 `useEffect` 相同。如果依赖数组为空，回调函数只会在组件挂载和卸载时执行一次；如果依赖数组中包含某些值，回调函数将在这些值发生变化时执行。

#### 使用场景

`useLayoutEffect` 适用于需要在 DOM 更新后立即读取布局信息或进行同步 DOM 操作的场景。例如：

1. **读取布局信息**：在需要读取元素尺寸或位置等布局信息的情况下，可以使用 `useLayoutEffect` 确保读取的信息是最新的。

2. **同步 DOM 操作**：当需要同步地进行 DOM 操作（如设置滚动位置、聚焦元素等）时，可以使用 `useLayoutEffect`。

3. **动画**：在处理复杂动画时，可能需要在布局完成后立即执行某些操作，以确保动画效果的正确性。

#### 示例

以下是一个使用 `useLayoutEffect` 的简单示例，它在组件挂载时读取一个元素的尺寸并设置其高度：

```javascript
import React, { useState, useRef, useLayoutEffect } from "react";

function MyComponent() {
  const [height, setHeight] = useState(0);
  const divRef = useRef();

  useLayoutEffect(() => {
    if (divRef.current) {
      const rect = divRef.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, []);

  return (
    <div>
      <div ref={divRef} style={{ height: "100px", background: "lightblue" }}>
        测试元素
      </div>
      <p>元素高度: {height}px</p>
    </div>
  );
}

export default MyComponent;
```

在这个示例中，`useLayoutEffect` 确保了在读取元素的尺寸之前，DOM 已经更新，但浏览器还没有进行下一次绘制，从而避免了闪烁或不一致的布局读取问题。

## Redux

1. 应用程序中发生了某些事情，例如用户单击按钮
2. dispatch 一个 action 到 Redux store，例如 dispatch({type: 'counter/increment'})
3. store 用之前的 state 和当前的 action 再次运行 reducer 函数，并将返回值保存为新的 state
4. store 通知所有订阅过的 UI，通知它们 store 发生更新
5. 每个订阅过 store 数据的 UI 组件都会检查它们需要的 state 部分是否被更新。
6. 发现数据被更新的每个组件都强制使用新数据重新渲染，紧接着更新网页

allsettle

# CSS

## BFC

CSS 中的 BFC（Block Formatting Context，块级格式化上下文）是页面上一个独立的渲染区域，具有特定的布局规则。了解 BFC 对于解决一些常见的 CSS 布局问题（如浮动清除、高度塌陷等）非常重要。

### BFC 的特性

1. **内部块级盒子会在垂直方向，一个接一个地排列。**
2. **BFC 区域不会与浮动元素重叠。**
3. **BFC 是一个独立的容器，容器内的子元素不会影响外部的元素。**
4. **计算 BFC 的高度时，浮动元素也会被计算在内。**

### 触发 BFC 的条件

以下 CSS 属性可以触发 BFC：

- `float` 不为 `none`
- `position` 为 `absolute` 或 `fixed`
- `display` 为 `inline-block`、`table-cell`、`table-caption`、`flex`、`inline-flex`
- `overflow` 不为 `visible`

### BFC 的应用场景

#### 1. 清除浮动

浮动元素会脱离文档流，可能导致父容器高度塌陷。使用 BFC 可以包含浮动元素，解决高度塌陷问题。

```html
<div class="container">
  <div class="float-box"></div>
</div>
```

```css
.container {
  overflow: hidden; /* 创建 BFC */
}

.float-box {
  float: left;
  width: 100px;
  height: 100px;
  background-color: red;
}
```

#### 2. 防止垂直外边距重叠

在普通的文档流中，相邻块级元素的垂直外边距会重叠。BFC 可以防止这种重叠。

```html
<div class="box1">Box 1</div>
<div class="box2">Box 2</div>
```

```css
.box1 {
  margin-bottom: 20px;
}

.box2 {
  margin-top: 20px;
  overflow: hidden; /* 创建 BFC */
}
```

#### 3. 包含浮动元素

父元素中有浮动元素时，父元素可能会高度塌陷。BFC 可以包含浮动元素，使父元素包含所有子元素。

```html
<div class="parent">
  <div class="child"></div>
</div>
```

```css
.parent {
  overflow: auto; /* 创建 BFC */
}

.child {
  float: left;
  width: 100px;
  height: 100px;
  background-color: blue;
}
```

#### 4. 防止文字环绕浮动元素

BFC 可以防止文字环绕浮动元素。

```html
<div class="container">
  <div class="float-box"></div>
  <p>Some text that should not wrap around the float.</p>
</div>
```

```css
.float-box {
  float: left;
  width: 100px;
  height: 100px;
  background-color: green;
}

.container {
  overflow: hidden; /* 创建 BFC */
}
```

### 总结

BFC 是 CSS 中一个重要的概念，它帮助我们理解和解决一些常见的布局问题。通过创建 BFC，我们可以清除浮动、避免垂直外边距重叠、包含浮动元素以及防止文字环绕浮动元素等。理解 BFC 的行为和应用场景，对于编写更健壮和灵活的布局代码非常有帮助。

## margin 合并

在 CSS 中，margin 合并（Margin Collapsing）是一个涉及相邻块级元素的垂直外边距（margin）的行为。它使得两个相邻元素的垂直 margin 在特定情况下会合并为一个，从而避免了累加的效果。理解 margin 合并有助于更好地控制布局和间距。以下是详细的介绍：

### Margin 合并的规则

#### 1. 相邻块级元素

当两个块级元素相邻时，它们之间的垂直 margin 会合并。合并后的 margin 值是两个相邻 margin 中的较大者。

例如：

```html
<div class="box1"></div>
<div class="box2"></div>
```

```css
.box1 {
  margin-bottom: 20px;
}
.box2 {
  margin-top: 10px;
}
```

在这种情况下，两个元素之间的 margin 不会相加，而是合并成一个 20px 的 margin。

#### 2. 嵌套块级元素

如果一个块级元素包含另一个块级元素，并且这两个元素的 margin 重叠，外部元素和内部元素的 margin 会合并。合并的结果也是取较大者。

例如：

```html
<div class="parent">
  <div class="child"></div>
</div>
```

```css
.parent {
  margin-top: 30px;
}
.child {
  margin-top: 20px;
}
```

在这种情况下，`.parent`和`.child`的上边距会合并为 30px，而不是 50px。

#### 3. 空的块级元素

当一个块级元素的上下边距相遇且该元素没有边框、内边距或内容时，它的上下 margin 会合并。

例如：

```html
<div class="empty"></div>
```

```css
.empty {
  margin-top: 15px;
  margin-bottom: 10px;
}
```

在这种情况下，`.empty`元素的上下 margin 会合并为 15px。

### 避免 Margin 合并的方法

#### 1. 使用边框或内边距

在元素上添加边框或内边距可以防止 margin 合并。例如：

```css
.parent {
  margin-top: 30px;
  border: 1px solid #000; /* 添加边框 */
}
```

#### 2. 使用浮动或绝对定位

浮动元素或使用绝对定位的元素不会发生 margin 合并。

```css
.child {
  margin-top: 20px;
  position: absolute; /* 绝对定位 */
}
```

#### 3. 使用 Flexbox 布局

在 Flexbox 布局中，子元素之间不会发生 margin 合并。

```css
.parent {
  display: flex;
  flex-direction: column;
}
.child {
  margin-top: 20px;
}
```

#### 4. 使用 display: flow-root

将元素设置为`display: flow-root`，创建一个新的块级格式化上下文，可以防止 margin 合并。

```css
.parent {
  margin-top: 30px;
  display: flow-root;
}
```

### 示例与代码演示

#### 示例 1：相邻块级元素

```html
<div class="box1"></div>
<div class="box2"></div>
```

```css
.box1 {
  margin-bottom: 20px;
  height: 50px;
  background-color: lightblue;
}
.box2 {
  margin-top: 10px;
  height: 50px;
  background-color: lightcoral;
}
```

#### 示例 2：嵌套块级元素

```html
<div class="parent">
  <div class="child"></div>
</div>
```

```css
.parent {
  margin-top: 30px;
  background-color: lightgreen;
}
.child {
  margin-top: 20px;
  height: 50px;
  background-color: lightpink;
}
```

通过理解和利用这些规则和方法，开发者可以更好地控制和调整网页布局中的 margin，避免不必要的间距问题。

## grid 布局

CSS Grid 布局是一种强大的二维布局系统，旨在更简便地构建复杂的网页布局。Grid 布局允许开发者创建行和列，并将元素精确地放置在这些行和列上，从而实现灵活的布局设计。以下是对 CSS Grid 布局的详细介绍：

### 1. 基本概念

#### 容器和项目

- **Grid 容器（Grid Container）**：通过设置`display: grid;`或`display: inline-grid;`，元素变成 Grid 容器。
- **Grid 项目（Grid Items）**：Grid 容器内的直接子元素自动成为 Grid 项目。

### 2. 定义网格

#### 显式网格（Explicit Grid）

通过`grid-template-columns`和`grid-template-rows`属性定义网格的列和行。

```css
.container {
  display: grid;
  grid-template-columns: 100px 200px auto;
  grid-template-rows: 100px 300px;
}
```

这段代码创建了一个包含三列和两行的网格，列宽分别为 100px、200px 和自动分配的宽度，行高分别为 100px 和 300px。

#### 隐式网格（Implicit Grid）

当项目放置在未显式定义的网格区域时，CSS Grid 会自动创建隐式网格轨道。通过`grid-auto-rows`和`grid-auto-columns`属性设置隐式轨道的大小。

```css
.container {
  display: grid;
  grid-auto-rows: 150px;
  grid-auto-columns: 150px;
}
```

### 3. 放置项目

#### 使用网格线（Grid Lines）

通过指定项目的起始和结束网格线，控制项目的放置位置。

```css
.item1 {
  grid-column-start: 1;
  grid-column-end: 3;
  grid-row-start: 1;
  grid-row-end: 2;
}
```

这段代码将`item1`放置在从第一列开始到第三列结束，从第一行开始到第二行结束的区域。

#### 使用网格区域（Grid Areas）

通过`grid-template-areas`属性定义命名网格区域，并将项目放置在指定区域。

```css
.container {
  display: grid;
  grid-template-areas:
    "header header"
    "sidebar content"
    "footer footer";
  grid-template-columns: 1fr 3fr;
  grid-template-rows: auto;
}

.header {
  grid-area: header;
}
.sidebar {
  grid-area: sidebar;
}
.content {
  grid-area: content;
}
.footer {
  grid-area: footer;
}
```

这段代码创建了一个三行两列的布局，并将项目放置在命名的网格区域中。

### 4. 对齐和间距

#### 网格间距（Gap）

使用`grid-gap`、`grid-row-gap`和`grid-column-gap`设置网格项目之间的间距。

```css
.container {
  display: grid;
  grid-gap: 10px;
}
```

#### 项目对齐

使用`justify-items`和`align-items`属性对齐项目。

- `justify-items`: 水平方向对齐（start, end, center, stretch）
- `align-items`: 垂直方向对齐（start, end, center, stretch）

```css
.container {
  display: grid;
  justify-items: center;
  align-items: start;
}
```

使用`justify-content`和`align-content`属性对齐整个网格。

- `justify-content`: 水平对齐整个网格（start, end, center, space-between, space-around, space-evenly）
- `align-content`: 垂直对齐整个网格（start, end, center, space-between, space-around, space-evenly）

```css
.container {
  display: grid;
  justify-content: space-between;
  align-content: center;
}
```

### 5. 响应式布局

CSS Grid 布局与媒体查询结合，可以轻松创建响应式布局。

```css
.container {
  display: grid;
  grid-template-columns: 1fr;
}

@media (min-width: 600px) {
  .container {
    grid-template-columns: 1fr 1fr;
  }
}
```

这段代码在屏幕宽度大于 600px 时，将布局从单列切换为两列。

### 6. 示例代码

以下是一个简单的 CSS Grid 布局示例：

```html
<div class="container">
  <div class="header">Header</div>
  <div class="sidebar">Sidebar</div>
  <div class="content">Content</div>
  <div class="footer">Footer</div>
</div>
```

```css
.container {
  display: grid;
  grid-template-areas:
    "header header"
    "sidebar content"
    "footer footer";
  grid-template-columns: 1fr 3fr;
  grid-template-rows: auto;
  gap: 10px;
}

.header {
  grid-area: header;
  background-color: lightblue;
}

.sidebar {
  grid-area: sidebar;
  background-color: lightcoral;
}

.content {
  grid-area: content;
  background-color: lightgreen;
}

.footer {
  grid-area: footer;
  background-color: lightgrey;
}
```

通过这些基本概念和示例，您可以开始使用 CSS Grid 布局构建复杂和响应迅速的网页布局。CSS Grid 布局的灵活性和强大功能使得它成为现代 Web 开发中的重要工具。

# 待解决

模块联邦
隔离
