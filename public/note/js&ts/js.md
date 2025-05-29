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

# 垃圾回收

在 JavaScript 中，垃圾回收（Garbage Collection, GC）是由引擎自动管理的，用于回收不再使用的内存资源。虽然开发者不需要手动管理内存，但了解垃圾回收的机制有助于更高效地编写代码并避免内存泄漏。

JavaScript 中的垃圾回收主要依赖以下两种方式：

### 1. **引用计数（Reference Counting）**

引用计数是一种垃圾回收方式，其中每个对象都有一个计数器，记录该对象被引用的次数。每当一个对象被引用时，它的引用计数增加；当引用不再存在时，引用计数减少。

- **原理**：

  - 每当有一个新的引用指向一个对象时，该对象的引用计数增加。
  - 当一个引用被删除或指向其他对象时，该对象的引用计数减少。
  - 当对象的引用计数为零时，说明没有任何引用指向该对象，该对象可以被回收。

- **优缺点**：

  - **优点**：实现简单，能够实时回收内存。
  - **缺点**：无法处理循环引用（两个对象相互引用对方，即使它们不再使用），导致内存泄漏。

#### 示例：

```javascript
let obj1 = { name: "Alice" };
let obj2 = { name: "Bob" };

obj1.ref = obj2; // obj1 引用 obj2
obj2.ref = obj1; // obj2 引用 obj1

obj1 = null; // 断开 obj1 的引用
obj2 = null; // 断开 obj2 的引用
// 由于 obj1 和 obj2 相互引用，引用计数无法减少到 0，导致内存泄漏
```

### 2. **标记-清除（Mark-and-Sweep）**

标记-清除是现代 JavaScript 引擎使用的垃圾回收算法。它通过两步过程来回收内存：标记和清除。

- **原理**：

  1. **标记阶段**：垃圾回收器首先遍历所有可达对象，标记那些能够从根对象（例如全局对象、函数的局部变量等）访问到的对象。可达对象是指程序中仍然有引用指向的对象。
  2. **清除阶段**：垃圾回收器遍历所有对象，删除那些没有被标记为可达的对象，并释放它们占用的内存。

- **优缺点**：

  - **优点**：能够正确处理循环引用的问题，适用于复杂的引用关系。
  - **缺点**：可能会导致性能问题，因为它需要遍历整个对象图。

#### 示例：

```javascript
let obj1 = { name: "Alice" };
let obj2 = { name: "Bob" };

obj1.ref = obj2; // obj1 引用 obj2
obj2.ref = obj1; // obj2 引用 obj1

obj1 = null; // 断开 obj1 的引用
obj2 = null; // 断开 obj2 的引用
// 由于标记-清除算法会识别 obj1 和 obj2 无法访问，最终会清除它们
```

### 3. **分代收集（Generational Garbage Collection）**

分代收集是现代 JavaScript 引擎常用的一种垃圾回收策略。它基于这样的假设：大多数对象都会很快变得不可达，因此可以根据对象的生命周期将对象分为不同的“代”（generation）。通常分为**年轻代（Young Generation）**和**老年代（Old Generation）**。

- **原理**：

  - **年轻代**：新创建的对象首先存储在年轻代中。由于这些对象通常会迅速变得不可达，因此垃圾回收器会频繁地对年轻代进行垃圾回收。
  - **老年代**：那些在年轻代存活了一段时间的对象会被转移到老年代。由于这些对象的生命周期较长，因此垃圾回收的频率较低。

  垃圾回收器会分阶段进行回收：

  - **Minor GC**：回收年轻代，频繁发生。
  - **Major GC**：回收老年代，较少发生。

- **优缺点**：

  - **优点**：优化了垃圾回收的效率，减少了不必要的回收工作，提高了性能。
  - **缺点**：需要更多的内存管理和优化策略，可能会导致垃圾回收时的延迟（虽然相对较少）。

#### 示例：

- 在分代收集中，垃圾回收器会经常对年轻代中的短命对象进行清理，老年代对象则会经历较少的回收。

### 4. **增量收集（Incremental Collection）**

增量收集是另一种垃圾回收优化策略。它将垃圾回收过程分解为多个小步骤，每次只进行少量的工作，然后暂停，继续处理其他任务，避免长时间的暂停（“停顿”）。

- **原理**：

  - 增量收集将垃圾回收分成多个小的增量步骤，避免一次性清除大量内存导致应用程序的卡顿。
  - 每次垃圾回收只处理部分对象，在下一次收集时继续处理剩余对象。

- **优缺点**：

  - **优点**：减少了垃圾回收期间的暂停时间，改进了用户体验，避免应用程序停顿过长。
  - **缺点**：增加了回收的复杂性和资源消耗。

### 5. **并行收集（Parallel Collection）**

并行收集是利用多核处理器进行垃圾回收的技术。在并行收集模式下，垃圾回收任务会被分解并由多个 CPU 核心同时执行，从而加快垃圾回收过程。

- **原理**：

  - 垃圾回收的不同阶段会在不同的 CPU 核心上并行执行。
  - 在现代浏览器和 Node.js 中，通常会在后台线程中并行执行垃圾回收任务。

- **优缺点**：

  - **优点**：加快垃圾回收速度，减少暂停时间。
  - **缺点**：增加了实现的复杂性，可能会占用更多的 CPU 资源。

### 6. **托管堆（Heap）和栈（Stack）**

在 JavaScript 的内存管理中，对象通常存储在 **堆** 中，而基本数据类型（如数字、布尔值等）存储在 **栈** 中。垃圾回收通常针对堆中的对象进行回收，因为栈上的值是自动管理的。

- **栈**：自动管理内存，函数调用结束时，局部变量会自动释放。
- **堆**：动态分配内存，当不再有引用指向堆中的对象时，它们会被垃圾回收。

### 总结

JavaScript 引擎的垃圾回收机制通过以下几种主要方法进行内存管理：

1. **引用计数**：通过对象的引用计数来判断何时回收对象。
2. **标记-清除**：通过标记可达对象并清除不可达对象来回收内存。
3. **分代收集**：通过将对象分为年轻代和老年代来优化垃圾回收的效率。
4. **增量收集**：将垃圾回收过程分解为多个小步骤，减少长时间的停顿。
5. **并行收集**：利用多核处理器加速垃圾回收过程。

每种方法都有其适用场景，现代 JavaScript 引擎通常会结合使用这些技术来优化性能，尽量减少垃圾回收对应用程序性能的影响。

## 实现垃圾回收的方式

为了让一个变量（尤其是对象类型的变量）能够被垃圾回收，我们需要确保没有任何活动的引用指向该变量。JavaScript 中的垃圾回收是自动进行的，但要确保一个变量可以被垃圾回收，有几个关键点需要遵守。

以下是几种可以让变量被垃圾回收的方法：

### 1. **显式地将引用设为 `null` 或 `undefined`**

将变量设为 `null` 或 `undefined`，可以使得该变量不再引用其原始值或对象。这样，如果没有其他引用指向该对象，垃圾回收器就可以回收这块内存。

#### 示例：

```javascript
let obj = { name: "Alice" };

// 显式将 obj 设置为 null
obj = null; // 此时 obj 不再引用原始对象
```

此时，`obj` 变量被设置为 `null`，如果没有其他引用指向该对象，垃圾回收器就会回收该对象。

### 2. **删除对象的属性**

如果对象的属性引用了另一个对象或变量，删除这些属性也可以让这些对象被垃圾回收。特别是如果这些属性的值是对象，并且没有其他引用指向它们时，它们会被回收。

#### 示例：

```javascript
let obj1 = { name: "Alice" };
let obj2 = { name: "Bob" };

obj1.ref = obj2; // obj1 引用 obj2

// 删除 obj1 中对 obj2 的引用
delete obj1.ref; // 此时 obj2 不再被 obj1 引用

// 如果没有其他引用指向 obj2，它将会被垃圾回收
```

### 3. **让变量超出作用域**

当一个变量的作用域结束时（例如函数执行完毕，或者对象不再有效），如果没有其他引用指向它，它将自动成为垃圾回收的候选对象。

#### 示例：

```javascript
function test() {
  let obj = { name: "Alice" }; // obj 仅在函数作用域内有效
} // 当函数执行完毕，obj 会超出作用域

// 此时，obj 被垃圾回收
```

在函数 `test` 执行完毕后，`obj` 变量超出了作用域。如果 `obj` 没有其他引用，它会被回收。

### 4. **使用弱引用类型（如 `WeakMap` 和 `WeakSet`）**

弱引用类型（如 `WeakMap` 和 `WeakSet`）会存储弱引用对象，这意味着如果没有其他强引用指向对象，该对象会自动被垃圾回收，而不会阻止垃圾回收器清除它。

#### 示例（使用 `WeakMap`）：

```javascript
let obj = { name: "Alice" };

const weakMap = new WeakMap();
weakMap.set(obj, "some value"); // obj 作为 WeakMap 的键

// 删除 obj 的引用
obj = null; // obj 会被垃圾回收

// weakMap 中的值会被清理，因为 obj 没有其他引用指向它
```

这里，`WeakMap` 会自动管理 `obj` 的引用。如果 `obj` 不再被引用，它会自动被垃圾回收。

### 5. **避免闭包导致的内存泄漏**

闭包可以导致变量长时间保持在内存中，因此需要避免创建不必要的闭包，尤其是当它们包含对大量数据或对象的引用时。确保不再使用的变量能够及时被回收，可以避免内存泄漏。

#### 示例：

```javascript
function createClosure() {
  let obj = { name: "Alice" }; // obj 被闭包引用

  return function () {
    console.log(obj.name);
  };
}

let closure = createClosure(); // 闭包引用了 obj

// 如果此时没有其他引用指向 obj，obj 将不会被回收
```

在上述代码中，`createClosure` 返回的闭包会持续持有 `obj` 的引用，因此，直到闭包被销毁，`obj` 才能被垃圾回收。确保在不再需要闭包时将其删除，可以帮助及时释放资源。

### 6. **避免全局变量**

全局变量在整个程序中都有引用，因此很难被垃圾回收。尽量避免在全局作用域中创建不必要的变量或对象。可以通过 `let` 或 `const` 来避免意外创建全局变量（尤其是在函数内部）。

#### 示例：

```javascript
// 不推荐的做法
globalVar = { name: "Alice" }; // 全局变量，无法被垃圾回收

// 推荐做法
let obj = { name: "Alice" }; // 局部变量，在函数执行完后可以被回收
```

### 7. **垃圾回收器的自动回收机制**

垃圾回收器会自动识别不再需要的对象并回收它们，但前提是这些对象不再被任何活动的引用所引用。因此，只要确保对象不再被引用，它们就会成为垃圾回收的候选对象。可以依赖 JavaScript 引擎的自动垃圾回收，而不必显式地进行内存管理。

### 总结

为了让变量可以被垃圾回收，确保以下几点：

- **移除引用**：通过显式设置变量为 `null` 或 `undefined`，或者删除对象的属性来移除引用。
- **超出作用域**：让变量超出作用域，使得它不再被任何引用所引用。
- **避免闭包造成的引用**：避免在闭包中创建不必要的引用，及时清理不再需要的闭包。
- **使用弱引用类型**：使用 `WeakMap` 或 `WeakSet` 来存储对象，它们不会阻止对象的垃圾回收。
- **避免全局变量**：避免创建全局变量或保持对不再需要的全局变量的引用。

这些做法有助于确保对象可以被垃圾回收，避免内存泄漏，保持应用程序的性能。

# 定时器相关

### setTimeout

### setInterval

### requestAnimationFrame

# switch“穿透”

在 JavaScript 中，switch 语句的控制流会**“穿透”**，除非明确使用 break 或 return 等语句来终止执行。

为何会触发后续逻辑？

    1.	switch 的默认行为：
    •	如果 case 的代码块中没有 break 或 return，程序会继续执行下一个 case 的代码块，即使条件不匹配。
    •	这种行为被称为“fall-through”（穿透）。
    2.	你的代码分析：
    •	当 key === ItemKeys.ITEM_KEY_PROLOGUE_PLOT_IMAGE 时，进入第一个 case：

case ItemKeys.ITEM_KEY_PROLOGUE_PLOT_IMAGE:
console.log('IMAGE--->', item2);
if (item.value instanceof ImageItem) {
plotModel.collectImage(getImage(item.value));
}

如果没有 break 或 return，控制流会继续执行下一个 case（ItemKeys.ITEM_KEY_PROLOGUE_PLOT），然后再继续执行 ItemKeys.ITEM_KEY_PROLOGUE_PLOT_VOICE。

    •	结果是，匹配到 ITEM_KEY_PROLOGUE_PLOT_IMAGE 后，不仅会执行该分支的逻辑，还会执行 ITEM_KEY_PROLOGUE_PLOT 和 ITEM_KEY_PROLOGUE_PLOT_VOICE 的逻辑。

    3.	解决方式：
    •	在每个 case 块的末尾添加 break 或 return，以防止意外穿透。

正确的写法

使用 break

```ts
switch (key) {
  case ItemKeys.ITEM_KEY_PROLOGUE_PLOT_IMAGE:
    console.log("IMAGE--->", item2);
    if (item.value instanceof ImageItem) {
      plotModel.collectImage(getImage(item.value));
    }
    break; // 防止穿透
  case ItemKeys.ITEM_KEY_PROLOGUE_PLOT:
    console.log("TEXT--->", item2);
    if (item.value instanceof TextItem) {
      plotModel.collectPlot(getText(item.value));
    }
    break; // 防止穿透
  case ItemKeys.ITEM_KEY_PROLOGUE_PLOT_VOICE:
    console.log("VOICE--->", item2);
    break; // 防止穿透
}
```

使用 return（如果需要提前终止函数）

```ts
switch (key) {
  case ItemKeys.ITEM_KEY_PROLOGUE_PLOT_IMAGE:
    console.log("IMAGE--->", item2);
    if (item.value instanceof ImageItem) {
      plotModel.collectImage(getImage(item.value));
    }
    return; // 防止后续逻辑
  case ItemKeys.ITEM_KEY_PROLOGUE_PLOT:
    console.log("TEXT--->", item2);
    if (item.value instanceof TextItem) {
      plotModel.collectPlot(getText(item.value));
    }
    return; // 防止后续逻辑
  case ItemKeys.ITEM_KEY_PROLOGUE_PLOT_VOICE:
    console.log("VOICE--->", item2);
    return; // 防止后续逻辑
}
```

总结

    •	break 是最常见的方式，用于退出 switch 语句，避免不必要的“穿透”。
    •	return 可以在函数中直接终止执行，适合处理 switch 位于函数中的情况。
    •	如果有特殊需求，某些情况下可以利用穿透的特性（例如多个 case 执行相同逻辑），但需要明确意图，避免意外错误。

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
