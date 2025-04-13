const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));
app.use("/avatars", express.static(path.join(__dirname, "avatars")));
app.use("/covers", express.static(path.join(__dirname, "covers")));

const avatarsDir = path.join(__dirname, "avatars");
if (!fs.existsSync(avatarsDir)) {
    fs.mkdirSync(avatarsDir);
}

const coversDir = path.join(__dirname, "covers");
if (!fs.existsSync(coversDir)) {
    fs.mkdirSync(coversDir);
}

const storageAvatars = multer.diskStorage({
    destination: "avatars/",
    filename: (req, file, cb) => {
        const username = req.query.username;
        if (!username) {
            return cb(new Error("Не передано имя пользователя"), null);
        }
        const ext = path.extname(file.originalname);
        cb(null, `${username}${ext}`);
    }
});
const uploadAvatar = multer({ storage: storageAvatars });

const storageCovers = multer.diskStorage({
    destination: "covers/",
    filename: (req, file, cb) => {
        const title = req.body.title; // Получаем title из тела запроса
        if (!title) {
            return cb(new Error("Не передано название товара"), null);
        }
        const ext = path.extname(file.originalname);
        // Удаляем недопустимые символы из названия файла
        const sanitizedTitle = title.replace(/[^a-zA-Z0-9-_]/g, "_");
        cb(null, `${sanitizedTitle}${ext}`);
    }
});
const uploadCover = multer({ storage: storageCovers });

app.get("/api/users", (req, res) => {
    fs.readFile("db.json", "utf8", (err, data) => {
        if (err) return res.status(500).send("Ошибка чтения файла!");
        res.json(JSON.parse(data).users);
    });
});

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

app.post("/api/upload-avatar", uploadAvatar.single("avatar"), (req, res) => {
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

if (!fs.existsSync("products.json")) {
    fs.writeFileSync("products.json", JSON.stringify({ products: [] }, null, 2));
}

app.get("/api/products", (req, res) => {
    fs.readFile("products.json", "utf8", (err, data) => {
        if (err) return res.status(500).send("Ошибка чтения файла!");
        res.json(JSON.parse(data).products);
    });
});

app.post("/api/products", (req, res) => {
    fs.readFile("products.json", "utf8", (err, data) => {
        if (err) return res.status(500).send("Ошибка чтения файла!");

        const db = JSON.parse(data || '{"products": []}');
        const newProduct = {
            id: db.products.length ? db.products[db.products.length - 1].id + 1 : 1,
            ...req.body
        };

        db.products.push(newProduct);

        fs.writeFile("products.json", JSON.stringify(db, null, 2), (err) => {
            if (err) return res.status(500).send("Ошибка записи файла!");
            res.status(201).send("Товар успешно добавлен!");
        });
    });
});

app.put("/api/products/:id", (req, res) => {
    const productId = parseInt(req.params.id);

    fs.readFile("products.json", "utf8", (err, data) => {
        if (err) return res.status(500).send("Ошибка чтения файла!");

        const db = JSON.parse(data || '{"products": []}');
        const index = db.products.findIndex(p => p.id === productId);

        if (index === -1) return res.status(404).send("Товар не найден!");

        db.products[index] = { ...db.products[index], ...req.body };

        fs.writeFile("products.json", JSON.stringify(db, null, 2), (err) => {
            if (err) return res.status(500).send("Ошибка записи файла!");
            res.send("Товар обновлён!");
        });
    });
});

app.delete("/api/products/:id", (req, res) => {
    const productId = parseInt(req.params.id);

    fs.readFile("products.json", "utf8", (err, data) => {
        if (err) return res.status(500).send("Ошибка чтения файла!");

        const db = JSON.parse(data || '{"products": []}');
        const productIndex = db.products.findIndex(p => p.id === productId);

        if (productIndex === -1) return res.status(404).send("Товар не найден!");

        const product = db.products[productIndex];
        const updatedProducts = db.products.filter(p => p.id !== productId);

        // Удаление файла обложки по имени товара (title)
        if (product.title && product.cover) {
            const sanitizedTitle = product.title.replace(/[^a-zA-Z0-9-_]/g, "_");
            const ext = path.extname(product.cover); // Получаем расширение из сохранённого имени файла
            const coverPath = path.join(__dirname, "covers", `${sanitizedTitle}${ext}`);
            console.log(`Попытка удалить обложку: ${coverPath}`);

            try {
                if (fs.existsSync(coverPath)) {
                    fs.unlinkSync(coverPath);
                    console.log(`Обложка ${coverPath} успешно удалена`);
                } else {
                    console.log(`Файл обложки ${coverPath} не существует`);
                }
            } catch (err) {
                console.error(`Ошибка при удалении обложки ${coverPath}:`, err.message);
            }
        } else {
            console.log(`У товара с ID ${productId} нет названия или обложки (title: ${product.title}, cover: ${product.cover})`);
        }

        db.products = updatedProducts;

        fs.writeFile("products.json", JSON.stringify(db, null, 2), (err) => {
            if (err) return res.status(500).send("Ошибка записи файла!");
            console.log(`Товар с ID ${productId} успешно удалён из products.json`);
            res.send("Товар удалён!");
        });
    });
});

app.post("/api/upload-cover", uploadCover.single("cover"), (req, res) => {
    if (!req.file) {
        return res.json({ success: false, message: "Ошибка загрузки файла!" });
    }
    console.log(`Обложка загружена: ${req.file.filename}`);
    res.json({ success: true, filename: req.file.filename });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});