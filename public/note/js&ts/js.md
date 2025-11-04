# Map & Set

## Map & WeakMap

`Map` 和 `WeakMap` 都是 JavaScript 中用于存储键值对的数据结构，它们的基本功能相似，但是有一些关键的区别，尤其是在处理键的类型和垃圾回收机制方面。

### 1. **键的类型**

- **`Map`**：`Map` 的键可以是任何类型的值，包括对象、函数、原始类型（如字符串、数字等）。`Map` 不限制键的类型，允许你使用任何类型的数据作为键。

- **`WeakMap`**：`WeakMap` 的键只能是对象（包括函数和数组等对象）。它不允许使用原始类型（如字符串、数字、布尔值等）作为键。

#### 示例：

```javascript
// Map
const map = new Map();
map.set("string", "value1"); // 允许使用字符串
map.set(123, "value2"); // 允许使用数字
map.set({ a: 1 }, "value3"); // 允许使用对象

// WeakMap
const weakmap = new WeakMap();
weakmap.set({ a: 1 }, "value3"); // 只能使用对象作为键
// weakmap.set('string', 'value1');  // 错误：不能使用原始类型作为键
```

### 2. **垃圾回收机制**

- **`Map`**：`Map` 对象中的键值对是强引用的。也就是说，只要 `Map` 本身没有被销毁，其中的键值对会一直存在，即使你不再使用这些键。如果你将一个对象作为键并不再引用它，它仍然会驻留在 `Map` 中，直到 `Map` 被垃圾回收。

- **`WeakMap`**：`WeakMap` 对象中的键是弱引用的。如果 `WeakMap` 中的键没有其他引用指向它，垃圾回收器会自动回收该键及其对应的值。这意味着，当对象作为 `WeakMap` 的键并且没有其他地方引用它时，垃圾回收会自动清理这个键值对。

#### 示例：

```javascript
let obj = { name: "Alice" };

// 创建一个 WeakMap
const weakmap = new WeakMap();

// 将对象作为键存入 WeakMap
weakmap.set(obj, "value");

// 删除对 obj 的引用
obj = null;

// 由于 WeakMap 是弱引用，垃圾回收器会清除键值对
```

在上面的例子中，`WeakMap` 中的键 `obj` 会在没有其他引用指向它时被自动回收，而 `Map` 中的键 `obj` 会一直存在，直到手动删除。

### 3. **迭代能力**

- **`Map`**：`Map` 是可迭代的。你可以使用 `forEach` 或 `for...of` 等方式遍历 `Map` 中的所有键值对。

- **`WeakMap`**：`WeakMap` 不是可迭代的。你不能使用 `forEach` 或 `for...of` 遍历 `WeakMap`，因为其键是弱引用，垃圾回收器可能随时删除其中的某些条目，无法保证其内容的可遍历性。

#### 示例：

```javascript
const map = new Map();
map.set("key1", "value1");
map.set("key2", "value2");

// 可迭代
for (const [key, value] of map) {
  console.log(key, value);
}

// WeakMap 不可迭代
const weakmap = new WeakMap();
// weakmap.set('key1', 'value1'); // 错误：WeakMap 只允许对象作为键
```

### 4. **性能**

- **`Map`**：`Map` 的键和值是强引用，因此，它们会一直存在于内存中，直到手动删除或者 `Map` 本身被销毁。由于 `Map` 没有垃圾回收机制，它在频繁地添加和删除键值对时性能可能会受到影响，尤其是当使用大量对象作为键时。

- **`WeakMap`**：由于 `WeakMap` 使用弱引用，键会随着没有其他引用时被自动回收，因此，`WeakMap` 不会增加内存使用量，也不需要手动清理垃圾数据。它在需要管理大量动态对象时，尤其适用于缓存和管理动态数据的场景。

### 5. **应用场景**

- **`Map`**：`Map` 适用于需要存储任意类型键值对的场景，尤其是在键的类型不受限制，并且你希望持久化这些数据（即，数据应在不再使用时仍然存在）。`Map` 可以用于很多数据存储和缓存的场景。

- **`WeakMap`**：`WeakMap` 主要用于需要自动清理键值对的场景，比如缓存某些对象的私有数据。由于 `WeakMap` 中的键是弱引用，当对象不再使用时，它的相关数据会自动被垃圾回收。例如，它非常适合存储对象的元数据、对象的私有属性等。

#### 示例场景：

- **`Map`**：

  - 存储用户设置、配置信息等。
  - 存储对象与其他值的映射关系，且不希望自动删除这些数据。

- **`WeakMap`**：

  - 为 DOM 元素添加元数据（例如事件处理程序或样式）；
  - 在缓存中存储对象的私有信息，不希望这些信息在没有引用时一直存在。

### 6. **总结对比表**

| 特性         | `Map`                                    | `WeakMap`                        |
| ------------ | ---------------------------------------- | -------------------------------- |
| **键的类型** | 可以是任意类型的值（包括对象、原始值等） | 只能是对象（包括函数、数组等）   |
| **垃圾回收** | 强引用，键值对不会被自动回收             | 弱引用，键没有其他引用时会被回收 |
| **迭代能力** | 可迭代，支持 `forEach`、`for...of` 等    | 不可迭代，无法遍历其中的条目     |
| **性能**     | 存在内存泄漏风险（需要手动清理）         | 自动清理，避免内存泄漏           |
| **使用场景** | 存储需要持久化的数据                     | 存储私有数据或需要自动清理的数据 |

### 总结

- `Map` 是一个标准的键值对集合，适用于需要频繁操作键值对并保持数据持久性的场景。
- `WeakMap` 主要适用于需要存储对象相关数据并希望在对象没有引用时自动回收这些数据的场景。

## Set & WeakSet

`Set` 和 `WeakSet` 都是 JavaScript 中用于存储唯一值的数据结构，具有相似的基本功能，但它们之间有一些关键的区别，尤其是在值的引用类型、垃圾回收机制和使用场景上。

### 1. **值的类型**

- **`Set`**：`Set` 中的值可以是任何类型的数据，包括原始类型（如字符串、数字、布尔值等）以及对象、函数等引用类型。`Set` 中的每个值都是唯一的，不允许重复。

- **`WeakSet`**：`WeakSet` 中的值只能是 **对象**，不能是原始值（如字符串、数字、布尔值等）。`WeakSet` 只能存储对象类型的值，并且它会保持对对象的 **弱引用**。

#### 示例：

```javascript
// Set
const mySet = new Set();
mySet.add(1); // 允许原始值
mySet.add("Hello"); // 允许原始值
mySet.add({ name: "Alice" }); // 允许对象

// WeakSet
const myWeakSet = new WeakSet();
myWeakSet.add({ name: "Alice" }); // 只能存储对象
// myWeakSet.add(1);  // 错误：只能存储对象
// myWeakSet.add('Hello');  // 错误：只能存储对象
```

### 2. **垃圾回收机制**

- **`Set`**：`Set` 是强引用的，意味着即使你不再使用某个对象，它在 `Set` 中的引用仍然存在，直到 `Set` 被垃圾回收或你手动删除该值。如果 `Set` 中的值是对象，那么这些对象不会被自动回收，除非显式删除。

- **`WeakSet`**：`WeakSet` 是弱引用的，意味着它不会阻止对象被垃圾回收。一旦 `WeakSet` 中的对象没有其他地方的引用，垃圾回收器会自动清除该对象及其在 `WeakSet` 中的引用。因此，`WeakSet` 不会增加内存使用量，也不需要手动清理垃圾数据。

#### 示例：

```javascript
let obj = { name: "Alice" };

// 创建 Set 和 WeakSet
const mySet = new Set();
const myWeakSet = new WeakSet();

// 向 Set 和 WeakSet 添加对象
mySet.add(obj);
myWeakSet.add(obj);

// 删除对 obj 的引用
obj = null;

// 在 Set 中，obj 仍然存在（不会被垃圾回收），即使你删除了对 obj 的引用
console.log(mySet.size); // 输出: 1 (mySet 仍然引用 obj)

// 在 WeakSet 中，obj 会被垃圾回收
console.log(myWeakSet); // 输出: WeakSet {}（myWeakSet 不再引用 obj）
```

### 3. **迭代能力**

- **`Set`**：`Set` 是 **可迭代** 的，你可以使用 `forEach` 或 `for...of` 来遍历其中的值。`Set` 会保留插入的顺序，允许你访问所有存储的值。

- **`WeakSet`**：`WeakSet` 是 **不可迭代** 的，它没有 `forEach`、`for...of` 等遍历方法。这是因为 `WeakSet` 中的对象是弱引用，它们可能在某一时刻被垃圾回收，无法保证始终可迭代。

#### 示例：

```javascript
// Set 可以被迭代
const mySet = new Set([1, 2, 3]);
for (const value of mySet) {
  console.log(value); // 输出: 1, 2, 3
}

// WeakSet 不能被迭代
const myWeakSet = new WeakSet();
myWeakSet.add({ name: "Alice" });
// myWeakSet.forEach(value => console.log(value));  // 错误：WeakSet 不支持迭代
```

### 4. **方法差异**

- **`Set`** 提供了多种方法：

  - `add(value)`：向 `Set` 添加值。
  - `has(value)`：检查 `Set` 是否包含某个值。
  - `delete(value)`：从 `Set` 中删除某个值。
  - `clear()`：清除 `Set` 中的所有值。
  - `size`：获取 `Set` 中的元素数量。

- **`WeakSet`** 提供了较少的方法，因为它只能操作对象：

  - `add(value)`：向 `WeakSet` 添加对象。
  - `has(value)`：检查 `WeakSet` 是否包含某个对象。
  - `delete(value)`：从 `WeakSet` 中删除对象。

  `WeakSet` **不提供** `clear()` 或 `size` 等方法，也不能迭代。

#### 示例：

```javascript
// Set 方法
const mySet = new Set();
mySet.add(1);
mySet.add(2);
console.log(mySet.has(1)); // 输出: true
mySet.delete(1);
console.log(mySet.has(1)); // 输出: false

// WeakSet 方法
const myWeakSet = new WeakSet();
const obj = { name: "Alice" };
myWeakSet.add(obj);
console.log(myWeakSet.has(obj)); // 输出: true
myWeakSet.delete(obj);
console.log(myWeakSet.has(obj)); // 输出: false
```

### 5. **内存管理**

- **`Set`**：由于 `Set` 使用的是强引用，所以只要该 `Set` 存在，里面的对象也不会被自动回收。这可能会导致内存泄漏，特别是在存储大量对象时。

- **`WeakSet`**：`WeakSet` 使用弱引用，因此不会阻止垃圾回收。只要对象不再被其他地方引用，它就会被自动清理，避免内存泄漏。

### 6. **典型应用场景**

- **`Set`**：当你需要存储任意类型的唯一值，且不需要频繁清理或自动回收对象时，`Set` 是一个合适的选择。它广泛用于去重、集合操作等场景。

- **`WeakSet`**：适用于存储对象类型的唯一值，并且希望这些对象在没有其他引用时能够自动被清理的场景。`WeakSet` 常用于管理对象的私有数据、缓存、DOM 元素等，不会因引用而阻止垃圾回收。

#### 示例：

- **`Set`**：用于存储唯一的用户 ID 或去重操作。
- **`WeakSet`**：用于存储唯一的 DOM 元素集合，在页面销毁时自动清理，避免内存泄漏。

### 7. **总结对比表**

| 特性         | `Set`                                   | `WeakSet`                                |
| ------------ | --------------------------------------- | ---------------------------------------- |
| **存储类型** | 可以存储任何类型（原始值 + 对象）       | 只能存储对象类型（包括函数、数组等对象） |
| **垃圾回收** | 强引用，不会自动清理对象                | 弱引用，键没有其他引用时会被自动清理     |
| **可迭代性** | 可迭代，支持 `forEach` 和 `for...of`    | 不可迭代，不支持 `forEach` 和 `for...of` |
| **方法**     | `add`，`has`，`delete`，`clear`，`size` | `add`，`has`，`delete`                   |
| **内存管理** | 可能导致内存泄漏                        | 自动清理内存，防止内存泄漏               |
| **使用场景** | 存储任意类型的唯一值，去重操作等        | 存储对象类型的唯一值，避免内存泄漏       |

### 总结：

- **`Set`** 是一个强引用的数据结构，适合存储任意类型的唯一值并需要进行迭代的场景。
- **`WeakSet`** 适用于存储对象类型的唯一值，并且希望这些对象在没有其他引用时能够自动清理的场景，防止内存泄漏。

# 定时器相关

### setTimeout

### setInterval

### requestAnimationFrame

# switch 穿透

在 JavaScript（以及许多其他语言）中，**`switch` 语句的“穿透”**（英文：_fall-through_）是指 **在某个 `case` 分支中没有使用 `break` 语句时，程序会继续执行下一个 `case` 的代码块**，而不会自动停止。

---

## 🧩 一、基本语法回顾

```js
switch (expression) {
  case value1:
    // 执行代码块1
    break;
  case value2:
    // 执行代码块2
    break;
  default:
  // 默认执行代码
}
```

- 当 `expression` 的值与某个 `case` 匹配时，执行该 `case` 的语句。
- **如果没有遇到 `break`**，则继续执行下面所有 `case` 中的代码（包括 `default`），直到遇到第一个 `break` 或语句结束为止。
- 这种行为被称为 **“switch 穿透（fall-through）”**。

---

## ⚙️ 二、示例：穿透的实际效果

```js
let fruit = "apple";

switch (fruit) {
  case "apple":
    console.log("苹果");
  case "banana":
    console.log("香蕉");
  case "orange":
    console.log("橙子");
    break;
  default:
    console.log("未知水果");
}
```

### 输出结果：

```
苹果
香蕉
橙子
```

### 原因：

- 匹配到 `"apple"` 后开始执行；
- 因为没有 `break`，继续执行下面的 `"banana"` 和 `"orange"`；
- 到 `"orange"` 的 `break` 才停止。

---

## 🧠 三、穿透的应用场景

虽然多数情况下我们会加 `break`，但**有时可以利用“穿透”来减少重复代码**。

### ✅ 合理使用穿透示例：

```js
let day = 6;

switch (day) {
  case 1:
  case 2:
  case 3:
  case 4:
  case 5:
    console.log("工作日");
    break;
  case 6:
  case 7:
    console.log("周末");
    break;
  default:
    console.log("未知");
}
```

这里：

- `1~5` 都执行同一逻辑；
- `6、7` 也执行相同逻辑；
- 通过**穿透**避免重复 `console.log("工作日")`。

---

## ⚠️ 四、容易出错的情况

### ❌ 无意间忘记 `break`

```js
let score = "B";

switch (score) {
  case "A":
    console.log("优秀");
  case "B":
    console.log("良好");
  case "C":
    console.log("及格");
  default:
    console.log("未知");
}
```

输出：

```
良好
及格
未知
```

> 原本只想输出“良好”，结果意外穿透到了后面所有分支。

---

## 🧩 五、如何避免错误穿透

1. **加上 `break`**
   每个 `case` 块后都写上 `break` 是最常见的做法。

2. **使用 `return`（函数中）**
   如果 `switch` 在函数内，可以直接使用 `return`，效果类似。

3. **注释说明穿透意图**
   当你**故意使用穿透**时，最好加上注释：

   ```js
   switch (level) {
     case 1:
       console.log("初级");
     // fall through
     case 2:
       console.log("中级");
       break;
   }
   ```

   👉 一些代码规范工具（如 ESLint）会检测到穿透并要求你加上 `// fall through` 注释，否则会报警。

---

## 💡 六、现代替代方案（更可读）

有时 `switch` + 穿透会降低可读性，尤其当逻辑复杂时，可以使用：

- **对象映射**
- **if-else**
- **Map**

### 示例：

```js
const actions = {
  apple: () => console.log("苹果"),
  banana: () => console.log("香蕉"),
  orange: () => console.log("橙子"),
};

(actions["banana"] || (() => console.log("未知")))();
```

更简洁、可维护性更好。

---

## ✅ 七、总结

| 特性         | 说明                                             |
| ------------ | ------------------------------------------------ |
| **穿透定义** | `switch` 中未使用 `break` 时，会继续执行后续分支 |
| **常见问题** | 忘记加 `break` 导致逻辑错误                      |
| **合理用法** | 多个 `case` 执行相同逻辑时                       |
| **最佳实践** | 有意穿透加注释；复杂逻辑用对象映射替代           |

---

是否希望我帮你扩展一下「switch 的编译原理」或「JS 引擎如何执行 switch 的底层逻辑」？那部分可以更深入地讲解它是如何在底层实现“穿透”的。

# 箭头函数

箭头函数 (`=>`) 和普通函数（`function`）在 JavaScript 中有几个**关键的区别**，不仅仅是语法，更重要的是它们在 **`this` 绑定**、**原型**、**构造函数能力** 等方面有本质差异。

---

## ✅ 一图速览

| 特性                 | 普通函数 (`function`) | 箭头函数 (`=>`)                     |
| -------------------- | --------------------- | ----------------------------------- |
| `this` 绑定行为      | 动态（调用时决定）    | 静态（定义时决定，继承外部 `this`） |
| 能否作为构造函数使用 | ✅（可以 `new`）      | ❌（不能 `new`）                    |
| 是否有 `prototype`   | ✅                    | ❌                                  |
| 是否有 `arguments`   | ✅                    | ❌（继承外层）                      |
| 可否作为对象方法     | ✅                    | ⚠️ 慎用，`this` 可能不是对象        |
| 语法简洁性           | 一般                  | ✅ 很简洁                           |

---

## 🔍 1. `this` 绑定行为（最核心区别）

### 普通函数：`this` 取决于**调用者**

```js
const obj = {
  name: "Alice",
  greet: function () {
    console.log(this.name); // this = obj
  },
};
obj.greet(); // 'Alice'
```

### 箭头函数：`this` 取决于**定义时的上下文**

```js
const obj = {
  name: "Alice",
  greet: () => {
    console.log(this.name); // this = 外层作用域，通常是 window / undefined
  },
};
obj.greet(); // undefined
```

---

## 🔍 2. 箭头函数不能作为构造函数

```js
const Foo = () => {};
const f = new Foo(); // ❌ TypeError: Foo is not a constructor
```

---

## 🔍 3. 没有 `arguments` 对象

```js
function normal() {
  console.log(arguments); // 有
}

const arrow = () => {
  console.log(arguments); // ❌ ReferenceError: arguments is not defined
};
```

箭头函数要获取参数，需用 **rest 参数**：

```js
const arrow = (...args) => {
  console.log(args);
};
```

---

## 🔍 4. 没有 `prototype`

```js
function A() {}
A.prototype.say = () => {}; // ✅

const B = () => {};
B.prototype.say = () => {}; // ❌ B.prototype 是 undefined
```

---

## 🧠 应用建议

| 场景                                              | 推荐函数类型              |
| ------------------------------------------------- | ------------------------- |
| 需要使用 `this` 的方法（如类方法）                | 普通函数                  |
| 回调函数、不关心 `this` 的地方（如 `map/filter`） | 箭头函数                  |
| 需要使用 `arguments` 的地方                       | 普通函数                  |
| 绑定事件监听器（有时需要解绑）                    | 普通函数                  |
| 内部函数希望继承外层 `this`                       | 箭头函数（比如 React 中） |

---

## 🧪 实例：React 中推荐用箭头函数

```js
function MyComponent() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount((c) => c + 1); // 箭头函数自动继承 this 和闭包上下文
  };

  return <button onClick={handleClick}>+1</button>;
}
```

---

如你想深入了解 `this` 的绑定机制、箭头函数的使用陷阱，或实际应用场景（如 React/Vue 中的建议），我可以继续帮你展开讲解。需要吗？

# 精度问题

在 JavaScript 中，`0.1 + 0.2 !== 0.3`。

具体来说：

```js
console.log(0.1 + 0.2 === 0.3); // false
console.log(0.1 + 0.2); // 0.30000000000000004
```

### 原因：

这是由于 **浮点数精度问题**。JavaScript 使用的是 IEEE 754 双精度浮点数标准，在这种表示方式下，某些小数无法被精确表示。例如：

- `0.1` 和 `0.2` 在二进制中是无限循环小数。
- 所以它们的加法结果并不是精确的 `0.3`，而是一个非常接近的值：`0.30000000000000004`。

### 解决方案：

可以使用一个精度误差容差（epsilon）来比较两个小数是否“足够接近”：

```js
const isEqual = Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON;
console.log(isEqual); // true
```

这样更符合实际场景中的“相等”判断。

# URLSearchParams

好的，我们来系统介绍一下 **`URLSearchParams`**，这是现代浏览器提供的原生 API，用于 **解析和操作 URL 查询参数（query string）**，非常方便。

---

## 🧩 一、什么是 URLSearchParams

- 它是一个类，用来处理 URL 中 `?key1=value1&key2=value2` 的查询参数
- 可以 **读取、增加、修改、删除、迭代** 参数

```js
const params = new URLSearchParams("?name=Alice&age=20");
```

---

## 🏗️ 二、常用方法

### 1️⃣ `get(name)`

- 获取参数值，返回字符串（第一个匹配的值）

```js
const params = new URLSearchParams("?name=Alice&age=20");
console.log(params.get("name")); // 'Alice'
console.log(params.get("age")); // '20'
console.log(params.get("gender")); // null
```

---

### 2️⃣ `getAll(name)`

- 获取所有同名参数值，返回数组

```js
const params = new URLSearchParams("?tag=js&tag=react");
console.log(params.getAll("tag")); // ['js', 'react']
```

---

### 3️⃣ `has(name)`

- 判断参数是否存在

```js
const params = new URLSearchParams("?name=Alice");
console.log(params.has("name")); // true
console.log(params.has("age")); // false
```

---

### 4️⃣ `set(name, value)`

- 设置参数值，如果存在则覆盖，否则添加

```js
const params = new URLSearchParams("?name=Alice");
params.set("name", "Bob"); // 覆盖
params.set("age", "20"); // 添加
console.log(params.toString()); // 'name=Bob&age=20'
```

---

### 5️⃣ `append(name, value)`

- 添加一个新的参数（不会覆盖已有同名参数）

```js
const params = new URLSearchParams("?tag=js");
params.append("tag", "react");
console.log(params.toString()); // 'tag=js&tag=react'
```

---

### 6️⃣ `delete(name)`

- 删除参数

```js
const params = new URLSearchParams("?name=Alice&age=20");
params.delete("age");
console.log(params.toString()); // 'name=Alice'
```

---

### 7️⃣ `toString()`

- 转为查询字符串

```js
const params = new URLSearchParams();
params.append("foo", "bar");
params.append("baz", "qux");
console.log(params.toString()); // 'foo=bar&baz=qux'
```

---

### 8️⃣ 遍历参数

#### `forEach` 遍历

```js
const params = new URLSearchParams("?name=Alice&age=20");
params.forEach((value, key) => {
  console.log(key, value);
});
// 输出:
// name Alice
// age 20
```

#### `entries()` / `keys()` / `values()`

```js
for (const [key, value] of params.entries()) console.log(key, value);
for (const key of params.keys()) console.log(key);
for (const value of params.values()) console.log(value);
```

---

### 9️⃣ 从 URL 对象获取查询参数

```js
const url = new URL("https://example.com/?name=Alice&age=20");
const params = url.searchParams;
console.log(params.get("name")); // 'Alice'
```

---

## ⚡ 十、实用技巧

1. **构建带参数的 URL**

```js
const params = new URLSearchParams({ name: "Alice", age: 20 });
const url = `https://example.com?${params.toString()}`;
console.log(url); // 'https://example.com?name=Alice&age=20'
```

2. **处理数组参数**

```js
const params = new URLSearchParams();
["js", "react"].forEach((tag) => params.append("tag", tag));
console.log(params.toString()); // 'tag=js&tag=react'
```

3. **更新 URL 而不刷新页面（SPA）**

```js
const params = new URLSearchParams(window.location.search);
params.set("page", "2");
history.replaceState(null, "", "?" + params.toString());
```

---

✅ 总结：

- `get` / `getAll` → 读取
- `set` / `append` → 修改/增加
- `delete` → 删除
- `has` → 判断
- `toString` → 转字符串
- `forEach` / `entries` / `keys` / `values` → 遍历

---

我可以帮你写一个 **React Hook 封装的 URLSearchParams 工具**，
支持 **读写参数 + 自动更新 URL + 响应参数变化**，非常方便 SPA 使用。

你希望我帮你写吗？

# `<script>` 标签详解（中文速查）

你问的是 `script` 标签 —— 我把内容整理成一张实用速查表，涵盖用法、常用属性、加载行为、模块、动态插入、安全和最佳实践。👍

---

## 一、基本用法

```html
<!-- 内联脚本 -->
<script>
  console.log("hello");
</script>

<!-- 外部脚本 -->
<script src="/static/app.js"></script>
```

内联脚本直接写在标签内；外部脚本通过 `src` 引入并下载执行。

---

## 二、重要属性与含义

- **`src`**：外部脚本 URL（相对或绝对）。存在时标签内的内容会被忽略。
- **`type`**：

  - 默认 `text/javascript`（可省略）。
  - `type="module"` 表示 ES module（支持 `import`/`export`，默认严格模式，module 脚本是异步且有自己的作用域）。

- **`async`**（只对外部脚本有效）：

  - 浏览器会并行下载脚本并尽快执行（下载完成就执行），不保证执行顺序。
  - 适合独立、不依赖其他脚本的第三方脚本（如统计）。

- **`defer`**（只对外部脚本有效）：

  - 并行下载，**延迟到 HTML 解析完成后、DOMContentLoaded 前**按加入顺序执行。
  - 适合需要保持执行顺序且不阻塞解析的脚本（常用于主体逻辑）。

- **`nomodule`**：

  - 与 `type="module"` 配合，用于向不支持 module 的旧浏览器提供回退脚本。

- **`crossorigin`**：设置跨域请求策略（`anonymous` 或 `use-credentials`），通常配合 `integrity` 使用。
- **`integrity`**：子资源完整性（SRI），用于校验外部脚本内容是否被篡改（指定哈希）。
- **`nonce` / `csp`**：用于 CSP（内容安全策略）允许特定内联脚本执行的机制。
- **`referrerpolicy`**：请求时的 referrer 策略。
- **`defer` 与 `async` 可同时设置？**：在规范中若两者同时存在，`async` 优先（但一般不要同时用以避免混乱）。

---

## 三、加载与执行时序（核心要点）

- **普通 `<script src>`（无 async/defer）**：HTML 解析暂停 → 下载（如果在缓存可能立即）→ 执行 → 恢复解析。会阻塞页面构建。
- **`async`**：HTML 解析不阻塞下载；下载完成立即执行（会中断解析）；多个 async 脚本执行顺序不可预测。
- **`defer`**：HTML 解析不阻塞下载；全部下载完成后按文档顺序执行；在 `DOMContentLoaded` 触发前完成执行。
- **`type="module"`**：行为像 `defer`（异步），但模块之间的导入解析与执行遵循 ES module 语义；每个 module 有自己作用域，顶层 `this` 是 `undefined`。

---

## 四、ES Module (`type="module"`) 特性

- 支持 `import` / `export`。
- 模块默认是延迟执行（类似 defer）。
- 模块在浏览器中按 CORS 原则请求（需要正确的响应头）。
- 模块内顶层可使用 `await`（Top-level await）。
- 模块相互之间是单例（同一模块只会被实例化一次）。

示例：

```html
<script type="module">
  import { foo } from "./lib.js";
  foo();
</script>
```

给不支持 module 的浏览器回退：

```html
<script type="module" src="main.mjs"></script>
<script nomodule src="legacy.js"></script>
```

---

## 五、动态插入脚本（运行时加载）

```js
const s = document.createElement("script");
s.src = "/chunk.js";
s.async = true; // 可选
document.head.appendChild(s);
```

动态插入脚本默认 `async` 行为（立即下载并执行）。若需 `defer` 行为，可用模块或控制加载顺序/回调。

---

## 六、安全相关

- **XSS 风险**：内联脚本最易被 XSS 利用。尽量将逻辑放外部文件并启用 CSP。
- **CSP（Content Security Policy）**：通过响应头 `Content-Security-Policy` 控制允许加载的脚本源，使用 `nonce` 或 `hash` 来允许特定内联脚本。
- **SRI (`integrity`)**：对第三方 CDN 脚本做哈希校验防篡改（需配合 `crossorigin`）。
- **避免 eval / new Function**：这些会绕过 CSP（或使策略更松），尽量避免。

示例（SRI）：

```html
<script
  src="https://cdn/.../lib.js"
  integrity="sha384-abcdef..."
  crossorigin="anonymous"
></script>
```

---

## 七、性能与最佳实践（实用清单）

- 将尽可能多的脚本设置为 **`defer`**，以避免阻塞解析且保持执行顺序。
- 对第三方分析/广告脚本使用 **`async`**（它们通常不依赖主应用）。
- 对于现代项目，优先考虑使用 **ES Modules**（`type="module"`）与 `nomodule` 回退策略。
- 使用 **SRI** 和 **CSP** 提升安全性。
- 把不影响首屏渲染的脚本放到页面底部或标记为 `defer`。
- 动态加载大体积脚本（code-splitting / lazy load）以减少首屏体积。
- 用 build 工具（Webpack/Rollup/Vite）生成 hashed 文件名并设置 `crossorigin` 与正确 header。

---

## 八、常见问题速答

- Q：`defer` 支持内联脚本吗？
  A：`defer` 只对外部脚本有意义，内联脚本会立即执行。

- Q：是否要总用 `async` 以提高性能？
  A：不是，`async` 会打乱执行顺序。若脚本相互依赖，使用 `defer`。

- Q：如何让第三方脚本不阻塞渲染？
  A：使用 `async` 或动态插入；或者把脚本放在页面底部并使用 `defer`。

---

如果你想，我可以：

- 给出一个**最佳实践模版**（`<head>` 与 `<body>` 的脚本如何组织）；
- 或者展示如何用 **CSP + nonce + SRI** 实现内联脚本安全策略；
- 还可以写一个小例子演示 `async` / `defer` / `module` 的执行顺序。

# DocumentFragment

好的，我们来讲 **`DocumentFragment`**，这是 DOM API 中一个非常有用的概念，尤其在 **批量操作 DOM、优化性能** 时常用。

---

## 一、`DocumentFragment` 是什么

`DocumentFragment` 是 **一个轻量级的、最小化的 DOM 容器**，它本身是 **文档片段**，可以包含节点，但 **不会成为页面的一部分**。

特点：

1. 它**不是普通的 DOM 元素**，它没有父节点。
2. 它**不会被渲染到页面**。
3. 插入 DOM 时，**它的子节点会被“整体移动”到目标 DOM**，而不是复制。

> 简单理解：`DocumentFragment` 就像一个**临时的 DOM 容器**，你可以先往里面拼装节点，最后一次性加入页面，减少重绘。

---

## 二、创建 `DocumentFragment`

```js
const fragment = document.createDocumentFragment();
```

---

## 三、典型用途

### 1️⃣ 批量插入 DOM（性能优化）

假设要往列表插入 1000 个 `<li>`：

```js
const ul = document.querySelector("ul");
const fragment = document.createDocumentFragment();

for (let i = 0; i < 1000; i++) {
  const li = document.createElement("li");
  li.textContent = "Item " + i;
  fragment.appendChild(li); // 先加到 fragment
}

ul.appendChild(fragment); // 一次性插入，减少回流
```

✅ 优点：

- 只会触发一次 DOM 插入；
- 避免了循环中多次回流和重绘。

---

### 2️⃣ 移动节点而非复制

```js
const fragment = document.createDocumentFragment();
const divs = document.querySelectorAll("div");

divs.forEach((div) => fragment.appendChild(div));

document.body.appendChild(fragment); // div 被移动到 body，而不是复制
```

> `DocumentFragment` 中的节点 **是引用移动**，不是复制。

---

### 3️⃣ 临时容器拼装复杂 DOM

```js
const fragment = document.createDocumentFragment();

const h1 = document.createElement("h1");
h1.textContent = "Title";
fragment.appendChild(h1);

const p = document.createElement("p");
p.textContent = "Paragraph";
fragment.appendChild(p);

document.body.appendChild(fragment);
```

> 在真实页面中只触发一次渲染。

---

## 四、与普通元素的区别

| 特性           | DocumentFragment         | 普通 DOM 元素        |
| -------------- | ------------------------ | -------------------- |
| 是否显示在页面 | ❌ 不显示                | ✅ 显示              |
| 是否有父节点   | ❌ 没有                  | ✅ 有（可能为 null） |
| 插入时效果     | 子节点会被移动到目标节点 | 元素整体插入         |
| 常用场景       | 批量 DOM 操作            | 单个节点或结构性布局 |

---

## 五、注意点

1. **只包含子节点**：DocumentFragment 本身不可见，只能操作其子节点。
2. **移动而不是复制**：`appendChild` 会把节点从 fragment 移到 DOM。
3. **适合动态拼装和性能优化**：特别是循环创建大量节点时。

---

✅ **总结一句话**：

> `DocumentFragment` 是一个轻量、不可见的 DOM 容器，用于在内存中先拼装节点，再一次性插入页面，减少重绘和回流，提高性能。

---

如果你愿意，我可以画一张 **`DocumentFragment` 插入 DOM 的流程图**，直观展示它的“临时容器 → 移动子节点 → 页面渲染”过程。

你希望我画吗？

# 循环引用

好的，我们来系统地讲一下 **循环引用（Circular Reference）**。

---

## 一、什么是循环引用

**循环引用（Circular Reference）** 指的是两个或多个对象（或模块）**相互引用、形成闭环**的情况。

简单来说，就是：

> A 依赖 B，而 B 又依赖 A。

这会导致一些问题，比如：

- 无法正确释放内存（内存泄漏）；
- 无法正确导入模块；
- JSON 序列化失败；
- 程序逻辑混乱或死循环。

---

## 二、代码层面举例

### 1️⃣ 对象引用中的循环引用

```js
const a = {};
const b = {};

a.b = b;
b.a = a;

console.log(a); // { b: { a: [Circular] } }
```

如果你执行：

```js
JSON.stringify(a);
```

就会报错：

```
TypeError: Converting circular structure to JSON
```

因为 JSON.stringify 无法处理循环引用。

---

### 2️⃣ 模块导入中的循环引用

假设我们在 Node.js 或前端模块化中有两个文件：

#### a.js

```js
import { bFunc } from "./b.js";

export function aFunc() {
  console.log("aFunc");
  bFunc();
}
```

#### b.js

```js
import { aFunc } from "./a.js";

export function bFunc() {
  console.log("bFunc");
  aFunc();
}
```

当其中一个模块被加载时，会导致循环导入：
`a.js` 需要 `b.js`，而 `b.js` 又依赖 `a.js`，从而形成闭环。

在 Node.js 中，这种情况会导致：

- 导入的值可能是 **undefined**；
- 代码执行顺序异常；
- 甚至出现栈溢出（递归调用）。

---

## 三、常见场景

### ✅ 1. **模块互相 import**

- 常见于业务逻辑耦合严重的项目。
- 如：`UserService` 调用 `OrderService`，`OrderService` 又依赖 `UserService`。

📌 解决方法：

- 抽取公共逻辑放入 `utils` 或 `core` 模块；
- 改为依赖注入；
- 延迟加载（`import()` 动态引入）。

---

### ✅ 2. **数据结构中对象相互引用**

比如在构建树或图结构时：

```js
const parent = { name: "root" };
const child = { name: "child", parent };
parent.child = child;
```

这种关系在逻辑上是合理的（父子互指），但在序列化或持久化（如 JSON、数据库存储）时会出问题。

📌 解决方法：

- 存储时打断循环（只保留 ID 或引用）；
- 使用能处理循环的库，如 `flatted` 或 `circular-json`。

---

### ✅ 3. **闭包中无意保留引用**

闭包会让变量一直存在于内存中。如果两个对象相互引用并通过闭包持有，会造成内存泄漏。

📌 解决方法：

- 避免在闭包中持有大型对象；
- 手动置 `null`；
- 使用 `WeakMap`、`WeakRef` 等弱引用结构。

---

## 四、如何检测循环引用

### JavaScript 中

可以通过 **递归检测对象引用**：

```js
function hasCircular(obj, seen = new Set()) {
  if (obj && typeof obj === "object") {
    if (seen.has(obj)) return true;
    seen.add(obj);
    for (const key in obj) {
      if (hasCircular(obj[key], seen)) return true;
    }
  }
  return false;
}
```

---

## 五、总结表格

| 类型           | 场景                    | 问题                 | 解决方案                   |
| -------------- | ----------------------- | -------------------- | -------------------------- |
| 对象相互引用   | 树/图结构               | JSON 序列化失败      | 使用 `flatted` 或只保留 ID |
| 模块互相引用   | import A←→B             | 导入为 `undefined`   | 提取公共模块或延迟加载     |
| 闭包引用       | 回调函数中引用          | 内存泄漏             | 使用 `WeakMap`、置 `null`  |
| 类之间相互依赖 | 类 A 引用 B，B 又引用 A | 循环依赖导致逻辑错乱 | 使用接口、依赖注入或抽象层 |

---

是否希望我再补充一下 **在 React/前端项目中循环依赖的常见表现和解决办法**？（比如组件之间互相 import、store 文件互引等）
