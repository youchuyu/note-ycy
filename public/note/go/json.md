# JSON 处理

非常好的问题 ✅
在 Go 语言中，**读取本地 JSON 文件并解析**是非常常见的操作，比如加载配置文件、初始化数据等。
下面我会分步骤讲解，并附带完整示例。

---

## 🧩 一、核心步骤概览

1. **读取文件内容** → 使用 `os.ReadFile`（或旧版的 `ioutil.ReadFile`）
2. **解析 JSON** → 使用标准库 `encoding/json` 的 `json.Unmarshal`
3. **将数据映射到结构体或 map**

---

## 🧱 二、示例一：解析到结构体

假设你有一个文件 `config.json`：

```json
{
  "name": "MyApp",
  "version": 1.2,
  "enabled": true,
  "servers": ["localhost", "127.0.0.1"]
}
```

### ✅ Go 代码：

```go
package main

import (
    "encoding/json"
    "fmt"
    "os"
)

type Config struct {
    Name    string   `json:"name"`
    Version float64  `json:"version"`
    Enabled bool     `json:"enabled"`
    Servers []string `json:"servers"`
}

func main() {
    // 1. 读取文件
    data, err := os.ReadFile("config.json")
    if err != nil {
        fmt.Println("读取文件错误:", err)
        return
    }

    // 2. 解析 JSON
    var cfg Config
    if err := json.Unmarshal(data, &cfg); err != nil {
        fmt.Println("解析 JSON 错误:", err)
        return
    }

    // 3. 使用数据
    fmt.Println("App Name:", cfg.Name)
    fmt.Println("Version:", cfg.Version)
    fmt.Println("Enabled:", cfg.Enabled)
    fmt.Println("Servers:", cfg.Servers)
}
```

### 输出结果：

```
App Name: MyApp
Version: 1.2
Enabled: true
Servers: [localhost 127.0.0.1]
```

---

## 🗺️ 三、示例二：解析为通用 `map[string]interface{}`

如果不确定 JSON 结构（动态 JSON）：

```go
package main

import (
    "encoding/json"
    "fmt"
    "os"
)

func main() {
    data, err := os.ReadFile("config.json")
    if err != nil {
        panic(err)
    }

    var result map[string]interface{}
    if err := json.Unmarshal(data, &result); err != nil {
        panic(err)
    }

    fmt.Println("结果:", result)
    fmt.Println("Name:", result["name"])
    fmt.Println("Servers:", result["servers"])
}
```

输出：

```
结果: map[enabled:true name:MyApp servers:[localhost 127.0.0.1] version:1.2]
Name: MyApp
Servers: [localhost 127.0.0.1]
```

> ⚠️ 注意：`map[string]interface{}` 的值类型都是 `interface{}`，使用时需要类型断言。

---

## 🧠 四、从文件流读取（适合大文件）

如果文件很大，不想一次性读入内存，可以使用 `json.Decoder`：

```go
package main

import (
    "encoding/json"
    "fmt"
    "os"
)

type Config struct {
    Name string `json:"name"`
}

func main() {
    f, err := os.Open("config.json")
    if err != nil {
        panic(err)
    }
    defer f.Close()

    decoder := json.NewDecoder(f)
    var cfg Config
    if err := decoder.Decode(&cfg); err != nil {
        panic(err)
    }

    fmt.Println(cfg)
}
```

这种方式 **边读边解码**，适合处理大型 JSON 文件或流式数据。

---

## 🧩 五、示例三：读取 JSON 数组

`data.json`：

```json
[
  { "id": 1, "name": "Alice" },
  { "id": 2, "name": "Bob" }
]
```

Go 代码：

```go
package main

import (
    "encoding/json"
    "fmt"
    "os"
)

type User struct {
    ID   int    `json:"id"`
    Name string `json:"name"`
}

func main() {
    bytes, _ := os.ReadFile("data.json")

    var users []User
    if err := json.Unmarshal(bytes, &users); err != nil {
        panic(err)
    }

    for _, u := range users {
        fmt.Printf("%d: %s\n", u.ID, u.Name)
    }
}
```

输出：

```
1: Alice
2: Bob
```

---

## ⚡ 六、小技巧与最佳实践

| 场景         | 推荐方法                           |
| ------------ | ---------------------------------- |
| 结构已知     | 用结构体 + `json.Unmarshal`        |
| 结构未知     | 用 `map[string]interface{}`        |
| 文件大       | 用 `json.Decoder`                  |
| 需要缩进输出 | 用 `json.MarshalIndent`            |
| 需要写回文件 | 用 `json.Marshal` + `os.WriteFile` |

---

## 🧾 七、写入 JSON 文件示例

```go
cfg := Config{
    Name: "MyApp",
    Version: 1.0,
    Enabled: true,
    Servers: []string{"localhost"},
}

data, _ := json.MarshalIndent(cfg, "", "  ")
os.WriteFile("config.json", data, 0644)
```

生成的文件带缩进、格式化良好。

---

是否希望我再给你补一段「读取任意路径 JSON 文件并自动检测文件是否存在」的安全封装函数？
例如：

```go
func LoadJSON(path string, v interface{}) error
```

可直接用于项目中。
