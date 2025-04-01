const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();
const PORT = 3000;

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); // Добавляем парсинг form-data
app.use(express.static(path.join(__dirname)));
app.use("/avatars", express.static(path.join(__dirname, "avatars")));

// Создание папки для аватарок, если её нет
const avatarsDir = path.join(__dirname, "avatars");
if (!fs.existsSync(avatarsDir)) {
    fs.mkdirSync(avatarsDir);
}

// Настройка `multer`
const storage = multer.diskStorage({
    destination: "avatars/",
    filename: (req, file, cb) => {
        const username = req.query.username; // Используем query-параметр
        if (!username) {
            return cb(new Error("Не передано имя пользователя"), null);
        }
        const ext = path.extname(file.originalname);
        cb(null, `${username}${ext}`);
    }
});
const upload = multer({ storage });

// Получение данных из `db.json`
app.get("/api/users", (req, res) => {
    fs.readFile("db.json", "utf8", (err, data) => {
        if (err) return res.status(500).send("Ошибка чтения файла!");
        res.json(JSON.parse(data).users);
    });
});

// Добавление нового пользователя
app.post("/api/users", (req, res) => {
    const newUser = { ...req.body, avatar: "" };

    fs.readFile("db.json", "utf8", (err, data) => {
        if (err) return res.status(500).send("Ошибка чтения файла!");

        const db = JSON.parse(data || '{"users": []}');
        if (db.users.some(user => user.username === newUser.username)) {
            return res.status(400).send("Такой пользователь уже существует!");
        }

        db.users.push(newUser);

        fs.writeFile("db.json", JSON.stringify(db, null, 2), (err) => {
            if (err) return res.status(500).send("Ошибка записи файла!");
            res.status(201).send("Пользователь успешно добавлен!");
        });
    });
});

// Загрузка аватарки
app.post("/api/upload-avatar", upload.single("avatar"), (req, res) => {
    const username = req.query.username;
    if (!req.file || !username) {
        return res.json({ success: false, message: "Ошибка загрузки файла!" });
    }

    fs.readFile("db.json", "utf8", (err, data) => {
        if (err) return res.status(500).send("Ошибка чтения файла!");

        let db = JSON.parse(data);
        let user = db.users.find(user => user.username === username);

        if (user) {
            user.avatar = req.file.filename;
            fs.writeFile("db.json", JSON.stringify(db, null, 2), (err) => {
                if (err) return res.status(500).send("Ошибка записи файла!");
                res.json({ success: true, filename: req.file.filename });
            });
        } else {
            res.json({ success: false, message: "Пользователь не найден!" });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});


app.post("/api/update-description", (req, res) => {
    const { username, description } = req.body;

    fs.readFile("db.json", "utf8", (err, data) => {
        if (err) return res.status(500).send("Ошибка чтения файла!");

        const db = JSON.parse(data || '{"users": []}');
        const user = db.users.find(user => user.username === username);

        if (!user) return res.status(404).send("Пользователь не найден!");

        user.description = description;

        fs.writeFile("db.json", JSON.stringify(db, null, 2), (err) => {
            if (err) return res.status(500).send("Ошибка записи файла!");
            res.send("Описание обновлено!");
        });
    });
});





