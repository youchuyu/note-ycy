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
