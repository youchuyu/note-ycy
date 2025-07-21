# 常用命令

以下是一个结合核心命令、实践建议和优质参考资源的 **MySQL 命令大全**，方便你快速上手和深入使用：

---

## ⚙️ 一、MySQL 客户端基础命令

- **登陆/退出数据库**

  ```sql
  mysql -u<用户名> -p            -- 登录，需手动输入密码
  exit; 或 quit;                -- 退出客户端
  ```

- **查看帮助**
  在 `mysql>` 提示符下输入：

  ```sql
  help; 或 \h; 或 \?;          -- 查看命令帮助和使用示例
  ```

- **连接指定数据库**

  ```sql
  mysql -uuser -p dbname        -- 登陆后直接进入指定数据库
  mysql> USE dbname;           -- 已登录状态下切换当前数据库
  ```

- **执行命令并退出**

  ```bash
  mysql -uuser -p dbname < script.sql
  ```

- **其他快捷操作**

  ```sql
  \c              -- 取消当前输入
  \G              -- 竖版显示查询结果
  show databases; -- 查看所有数据库
  show tables;    -- 查看当前库的所有表
  ```

---

## 🗃️ 二、数据库 & 用户管理

- **数据库操作**

  ```sql
  CREATE DATABASE dbname;
  DROP DATABASE dbname;
  SHOW DATABASES;
  USE dbname;
  ```

- **用户及权限管理**

  ```sql
  CREATE USER 'user'@'host' IDENTIFIED BY 'password';
  GRANT ALL PRIVILEGES ON *.* TO 'user'@'host';
  SHOW GRANTS FOR 'user'@'host';
  REVOKE ALL PRIVILEGES, GRANT OPTION FROM 'user'@'host';
  DROP USER 'user'@'host';
  ```

---

## 🧩 三、表结构 & DML 操作

- **表结构**

  ```sql
  SHOW TABLES;
  DESC tablename;
  SHOW CREATE TABLE tablename;
  CREATE TABLE users (...);
  DROP TABLE tablename;
  TRUNCATE TABLE tablename;
  ```

- **数据读写**

  ```sql
  SELECT * FROM table WHERE condition;
  INSERT INTO table(columns) VALUES(...);
  UPDATE table SET col=value WHERE condition;
  DELETE FROM table WHERE condition;
  ```

- **聚合与分组**

  ```sql
  SELECT COUNT(*), AVG(col), SUM(col) FROM table;
  SELECT col, COUNT(*) FROM table GROUP BY col;
  ```

- **连接查询**

  ```sql
  SELECT a.*, b.other FROM a JOIN b ON a.id = b.a_id;
  ```

---

## 🧠 四、高级与实用命令

- **事务管理**

  ```sql
  START TRANSACTION;
  COMMIT;
  ROLLBACK;
  ```

- **索引操作**

  ```sql
  CREATE INDEX idx_name ON table(col);
  DROP INDEX idx_name ON table;
  ```

- **执行脚本**

  ```sql
  SOURCE /path/to/script.sql;
  ```

- **查看运行时状态**

  ```sql
  SHOW STATUS;
  SHOW VARIABLES;
  SHOW WARNINGS;
  ```

---

## 📚 五、更多命令与选项资源

推荐参考以下官方与社区资料获取完整命令列表：

1. **MySQL 官方命令参考**：提供交互命令、客户端选项、帮助等详细文档 ([Gist][1], [dev.mysql.com][2])
2. **线上的 Cheat Sheet**：包含连接、DDL、DML、函数等实用速查表 ([QuickRef.ME][3])
3. **GitHub Gist 实用模板**：由社区提供整理好的常用命令备忘单 ([Gist][1])

---

## 🎯 学习建议 & 使用方式

- 推荐先打印或保存上述速查列表为「参考备忘表」。
- 在 `mysql>` 中多练习 `SHOW`、`DESCRIBE`、事务和索引操作。
- 使用 `SOURCE` 执行 SQL 脚本，将标准化操作流程。
- 可搭配 GUI 工具（如 MySQL Workbench、DBeaver）进行可视化操作。

---

## ✅ 总结一句话

- **常用命令**：登陆、数据库/表管理、CRUD、事务、索引、状态查看。
- **进阶技巧**：记住 `\G`、脚本执行、日志与状态命令。
- **资源推荐**：官方文档 + 社区 cheat sheet，随身携带提高效率。

---

如需对应 SQL 函数、窗口函数、性能调优、备份或复制命令，我也可以进一步整理，告诉我你的具体需求！

[1]: https://gist.github.com/hofmannsven/9164408?utm_source=chatgpt.com "MySQL CLI Cheatsheet - GitHub Gist"
[2]: https://dev.mysql.com/doc/en/mysql-commands.html?utm_source=chatgpt.com "MySQL 8.4 Reference Manual :: 6.5.1.2 mysql Client Commands"
[3]: https://quickref.me/mysql.html?utm_source=chatgpt.com "MySQL Cheat Sheet & Quick Reference"
