# Declare

# 函数重载

# d.ts

# interface 和 type 的区别

# 泛型

这两种实现之间的主要区别在于 **泛型的作用范围** 和 **接口的定义方式**。让我们逐一分析：

### 1. **`interface` 泛型定义（第一种实现）**

```typescript
interface HandleChangeFormData {
  <T extends CreateKeyType>(key: T, value: CreateReq[T]): void;
}
```

在这种方式中，`T` 是一个 **函数的局部泛型参数**，而不是整个接口的泛型。这个泛型只会在函数被调用时进行推断和使用。这意味着每次调用 `handleChangeFormData` 时，都可以为 `T` 提供不同的类型，而不是为接口本身提供一个通用的类型。

- **`T extends CreateKeyType`**：这个约束意味着 `T` 只能是 `CreateKeyType` 中的一个类型（如 `"name" | "gender" | "age"` 等）。
- **函数参数**：这个接口描述的是一个 **接受 `key` 和 `value` 两个参数的函数**，其中 `key` 必须是 `CreateKeyType` 中的一个类型，而 `value` 的类型则取决于 `key`，即 `CreateReq[T]`。

### 2. **接口泛型定义（第二种实现）**

```typescript
interface ChangeFormData<T extends CreateKeyType> {
  (key: T, value: CreateReq[T]): void;
}
```

在第二种实现中，`T` 是 **接口本身的泛型参数**。这意味着你在定义接口时就指定了一个类型 `T`，并且该接口描述的函数 **始终使用同一个 `T` 类型**，无论在什么地方使用这个接口。

- **`T extends CreateKeyType`**：与第一种方式一样，`T` 也受到了 `CreateKeyType` 的限制。
- **函数签名**：这个接口描述的是一个接受 `key` 和 `value` 参数的函数，和第一种方式类似，不过这个接口在被使用时需要明确指定 `T` 的类型（因为 `T` 是接口的泛型）。

### 主要区别

#### 泛型的作用范围：

- **第一种方式**：泛型 `T` 是 **局部的**，仅在函数调用时进行推断。这意味着每次调用函数时，`T` 的类型可以是不同的。例如，你可以在同一个 `handleChangeFormData` 函数中调用多次，并且每次传入不同的 `key`，TypeScript 会根据每次传入的 `key` 自动推断 `T` 的类型。
- **第二种方式**：泛型 `T` 是 **接口级别的**，它是在定义接口时就确定了一个类型。因此，**整个接口都使用同一个 `T`**，并且你需要在接口使用时传入类型参数。例如，使用 `ChangeFormData<"name">` 时，`T` 就被固定为 `"name"`，这意味着该接口只会接受 `key` 为 `"name"` 的调用，而 `value` 的类型会自动推断为 `CreateReq["name"]` 类型。

#### 使用示例：

##### 第一种方式：

```typescript
const handleChangeFormData: HandleChangeFormData = (key, value) => {
  // 这里 T 会根据 key 自动推断
  const newData = { ...formData };
  newData[key] = value;

  if (newData.name && newData.gender !== undefined) {
    setIsUnfold(true);
  }

  setFormData(newData);
};

// 可以在不同的调用中传递不同的 key 和 value 类型
handleChangeFormData("name", "John"); // T 自动推断为 "name"
handleChangeFormData("gender", "male"); // T 自动推断为 "gender"
```

##### 第二种方式：

```typescript
const handleChangeFormData: ChangeFormData<"name"> = (key, value) => {
  // 这里 T 是固定为 "name"
  const newData = { ...formData };
  newData[key] = value;

  if (newData.name && newData.gender !== undefined) {
    setIsUnfold(true);
  }

  setFormData(newData);
};

// 只能传递 "name" 作为 key
handleChangeFormData("name", "John"); // 正常
handleChangeFormData("gender", "male"); // 错误: "gender" 不是 "name"
```

#### 总结：

- **第一种实现**：更加灵活，适用于你希望在同一个函数中支持多种不同 `key` 的情况。
- **第二种实现**：适用于你需要定义一个接口，并希望函数使用一个固定的泛型类型（即为整个接口提供统一的 `T` 类型）。

# TS enum 替代方案

非常好的问题 👍
这个其实是很多 TypeScript 项目（尤其是 React、前端 SDK、或需要转译成 JS 的库）里经常遇到的痛点——
👉 **enum 不兼容某些打包器 / 运行时 / JSON 序列化**，或被要求不用 `enum`（比如 eslint 规则：`no-restricted-syntax`）。

---

## 🔍 一、为什么有时不建议用 `enum`

主要原因：

- **编译后生成额外代码**（尤其是数字枚举）；
- **Tree-shaking 无效**；
- **无法与 JSON 直接兼容**；
- **在前端库中增加包体积**；
- **在纯类型场景下反而不如字面量对象**。

---

## ✅ 替代方案 1：`const object + typeof`（推荐 ✅）

这是最常见、最推荐的替代方案，兼具 **类型安全** + **运行时值**。

```ts
export const Status = {
  Idle: "idle",
  Loading: "loading",
  Success: "success",
  Error: "error",
} as const;

export type Status = (typeof Status)[keyof typeof Status];
```

**使用：**

```ts
function setStatus(status: Status) {
  console.log(status);
}

setStatus(Status.Loading); // ✅ OK
setStatus("loading"); // ✅ OK
setStatus("wrong"); // ❌ 类型报错
```

**优点：**

- 运行时是普通对象 ✅
- 编译后无多余代码 ✅
- 可直接用于 JSON、React props ✅
- 类型自动推断出联合字面量 ✅

---

## ✅ 替代方案 2：联合字面量类型

如果你不需要运行时值（只是做类型约束），可以直接写联合类型。

```ts
export type Status = 'idle' | 'loading' | 'success' | 'error';

function setStatus(status: Status) { ... }
```

**优点：**

- 最轻量、最纯类型方式
- 不会在编译产物中出现任何额外代码

**缺点：**

- 无法在运行时使用（例如遍历所有状态）

---

## ✅ 替代方案 3：字符串字典 + keyof 类型

如果需要能动态遍历 key，可以用这种：

```ts
export const StatusMap = {
  Idle: "idle",
  Loading: "loading",
  Success: "success",
  Error: "error",
};

export type Status = keyof typeof StatusMap; // 'Idle' | 'Loading' | 'Success' | 'Error'
```

**使用：**

```ts
function handleStatus(status: Status) {
  console.log(StatusMap[status]);
}
```

---

## ✅ 替代方案 4：`string union helper`（工具函数封装）

可以封装一个辅助函数来快速定义枚举：

```ts
function createEnum<T extends string>(...values: T[]) {
  return Object.freeze(
    values.reduce((acc, v) => {
      acc[v] = v;
      return acc;
    }, {} as Record<T, T>)
  );
}

export const Status = createEnum("idle", "loading", "success", "error");
export type Status = keyof typeof Status;
```

---

## ✅ 替代方案 5：使用第三方工具库

一些库也提供了更安全、更优雅的枚举替代方案，比如：

- [`ts-enum-util`](https://www.npmjs.com/package/ts-enum-util)
- [`const-enum`](https://www.typescriptlang.org/docs/handbook/enums.html#const-enums)（⚠️ 注意编译选项 `preserveConstEnums`）
- [`zod`](https://zod.dev/) — 可以定义 `z.enum(['a', 'b'])` 同时做运行时校验

```ts
import { z } from "zod";
export const StatusSchema = z.enum(["idle", "loading", "success", "error"]);
export type Status = z.infer<typeof StatusSchema>;
```

---

## 🧠 总结对比

| 方案            | 是否有运行时值 | 是否类型安全 | 是否易于 JSON | 是否推荐           |
| --------------- | -------------- | ------------ | ------------- | ------------------ |
| `enum`          | ✅             | ✅           | ❌            | ❌（不推荐前端用） |
| `as const` 对象 | ✅             | ✅           | ✅            | ✅✅✅             |
| 联合类型        | ❌             | ✅           | ✅            | ✅                 |
| 字典 + keyof    | ✅             | ✅           | ✅            | ✅                 |
| zod / 工具函数  | ✅             | ✅           | ✅            | ✅（类型+校验）    |

---

💡 **结论推荐：**
在现代 TypeScript 项目中，**最通用的替代方案是：**

```ts
export const MyEnum = {
  Foo: "foo",
  Bar: "bar",
} as const;
export type MyEnum = (typeof MyEnum)[keyof typeof MyEnum];
```

---

是否希望我帮你写一个通用的 `createEnum` 工具函数（带类型推断 + 自动生成类型）？
可以像这样用：

```ts
const Status = createEnum("idle", "loading", "success");
type Status = EnumType<typeof Status>;
```
