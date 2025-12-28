# 🚀 Hướng Dẫn Deploy Dự Án QL CLB Sinh Viên Lên Hosting Miễn Phí

## 📋 Mục Lục
1. [Chuẩn Bị](#chuẩn-bị)
2. [Option 1: Deploy với Railway.app (Khuyên Dùng)](#option-1-railway-khuyên-dùng)
3. [Option 2: Deploy với Render.com](#option-2-render)
4. [Option 3: Deploy Frontend với Vercel/Netlify](#option-3-vercel-netlify)
5. [Kiểm Tra và Bảo Trì](#kiểm-tra)

---

## 🔧 Chuẩn Bị

### 1. Push Code Lên GitHub
```bash
# Khởi tạo git (nếu chưa có)
git init

# Thêm tất cả files
git add .

# Commit
git commit -m "Prepare for deployment"

# Tạo repository trên GitHub (https://github.com/new)
# Sau đó link và push
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### 2. Chuẩn Bị Database
Bạn cần export database hiện tại để import lên hosting:

```bash
# Export database
mysqldump -u root -p ql_clb_sv > database_backup.sql
```

---

## 🚂 Option 1: Deploy với Railway.app (KHUYÊN DÙNG)

### Ưu Điểm:
- ✅ **Miễn phí $5 credit/tháng** (đủ cho dự án nhỏ)
- ✅ Hỗ trợ MySQL native
- ✅ Deploy Backend + Frontend + Database cùng lúc
- ✅ Tự động deploy khi push code lên GitHub
- ✅ Có SSL miễn phí

### Bước 1: Đăng Ký Railway
1. Truy cập: https://railway.app
2. Đăng ký bằng GitHub account
3. Verify email

### Bước 2: Tạo New Project
1. Click **"New Project"**
2. Chọn **"Deploy from GitHub repo"**
3. Chọn repository của bạn
4. Railway sẽ tự động detect và tạo services

### Bước 3: Setup MySQL Database
1. Click **"+ New"** → **"Database"** → **"Add MySQL"**
2. Railway sẽ tạo MySQL instance
3. Click vào MySQL service → Tab **"Connect"**
4. Copy connection details (host, user, password, database)

### Bước 4: Import Database
```bash
# Kết nối tới Railway MySQL
mysql -h <RAILWAY_HOST> -u <USER> -p<PASSWORD> <DATABASE_NAME> < database_backup.sql
```

Hoặc dùng Railway CLI:
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Connect to MySQL
railway connect mysql

# Import data
source database/init/create_database.sql;
source database/init/insert_database.sql;
```

### Bước 5: Configure Backend Service
1. Click vào **Backend Service**
2. Vào tab **"Variables"**
3. Thêm các biến môi trường:

```
NODE_ENV=production
PORT=5000
DB_HOST=<từ MySQL connection>
DB_USER=<từ MySQL connection>
DB_PASSWORD=<từ MySQL connection>
DB_NAME=<từ MySQL connection>
JWT_SECRET=<tạo string random phức tạp>
SESSION_SECRET=<tạo string random phức tạp>
FRONTEND_URL=<sẽ có sau khi deploy frontend>
```

4. Vào tab **"Settings"**:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

5. Click **"Deploy"**

### Bước 6: Configure Frontend Service
1. Click **"+ New"** → **"GitHub Repo"** (nếu chưa có)
2. Hoặc click vào **Frontend Service** đã tạo
3. Vào tab **"Variables"**:

```
REACT_APP_API_URL=<URL của backend service>/api
```

4. Vào tab **"Settings"**:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npx serve -s build -l $PORT`

5. Install serve package - Thêm vào `frontend/package.json`:
```json
"dependencies": {
  ...existing,
  "serve": "^14.2.0"
}
```

6. Click **"Deploy"**

### Bước 7: Cập Nhật CORS
1. Copy URL của Frontend (ví dụ: `https://your-app.railway.app`)
2. Quay lại Backend Service → Tab **"Variables"**
3. Cập nhật `FRONTEND_URL` với URL vừa copy
4. Redeploy backend

### 🎉 Xong! Truy cập URL của Frontend để sử dụng

---

## 🎨 Option 2: Deploy với Render.com

### Ưu Điểm:
- ✅ **Hoàn toàn miễn phí** (nhưng có giới hạn)
- ✅ Backend + Frontend miễn phí
- ⚠️ **Hạn chế**: Chỉ hỗ trợ PostgreSQL miễn phí (cần convert từ MySQL)

### Bước 1: Convert MySQL → PostgreSQL (Tùy chọn)

**LƯU Ý**: Nếu không muốn chuyển sang PostgreSQL, bạn có thể:
- Dùng MySQL hosting bên ngoài: [FreeSQLDatabase.com](https://www.freesqldatabase.com/)
- Hoặc dùng [PlanetScale](https://planetscale.com/) (MySQL cloud miễn phí 5GB)

Với PlanetScale (Khuyên dùng):
1. Đăng ký tại: https://planetscale.com
2. Tạo database mới
3. Import data của bạn
4. Copy connection string

### Bước 2: Deploy Backend trên Render
1. Truy cập: https://render.com
2. Đăng ký bằng GitHub
3. Click **"New +"** → **"Web Service"**
4. Connect GitHub repository
5. Configure:
   - **Name**: `ql-clb-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

6. Environment Variables:
```
NODE_ENV=production
PORT=5000
DB_HOST=<your database host>
DB_USER=<your database user>
DB_PASSWORD=<your database password>
DB_NAME=ql_clb_sv
JWT_SECRET=<random string>
SESSION_SECRET=<random string>
FRONTEND_URL=<will add after frontend deploy>
```

7. Click **"Create Web Service"**

### Bước 3: Deploy Frontend trên Render
1. Click **"New +"** → **"Static Site"**
2. Connect cùng GitHub repository
3. Configure:
   - **Name**: `ql-clb-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`

4. Environment Variables:
```
REACT_APP_API_URL=<backend URL>/api
```

5. Click **"Create Static Site"**

### Bước 4: Cập Nhật CORS
1. Copy URL của Frontend Static Site
2. Vào Backend Web Service → Environment
3. Cập nhật `FRONTEND_URL`
4. Save Changes (sẽ tự động redeploy)

---

## 🌐 Option 3: Deploy Frontend với Vercel/Netlify + Backend Railway

Để tách riêng và tối ưu:

### Frontend trên Vercel:
1. Truy cập: https://vercel.com
2. Import GitHub repository
3. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Create React App`
   - **Environment Variables**:
     ```
     REACT_APP_API_URL=<Railway backend URL>/api
     ```
4. Deploy

### Frontend trên Netlify:
1. Truy cập: https://netlify.com
2. Drag & drop folder `frontend/build` hoặc connect GitHub
3. Build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/build`
4. Environment variables:
   ```
   REACT_APP_API_URL=<Railway backend URL>/api
   ```

---

## ✅ Kiểm Tra & Bảo Trì

### 1. Test Deployment
- [ ] Truy cập frontend URL
- [ ] Đăng nhập hệ thống
- [ ] Test các chức năng chính
- [ ] Test upload file
- [ ] Test chat/socket.io

### 2. Monitor
- Railway: Xem logs trong tab **"Deployments"**
- Render: Xem logs trong tab **"Logs"**

### 3. Custom Domain (Tùy chọn)
Cả Railway và Render đều hỗ trợ custom domain miễn phí:
1. Mua domain (từ Namecheap, GoDaddy...)
2. Vào Settings → Add custom domain
3. Cập nhật DNS records theo hướng dẫn

### 4. Cập Nhật Code
```bash
# Sau khi sửa code
git add .
git commit -m "Update features"
git push

# Railway/Render sẽ tự động redeploy!
```

---

## 🆘 Troubleshooting

### Lỗi Database Connection:
- Kiểm tra DB_HOST, DB_USER, DB_PASSWORD
- Verify database đã import đủ tables
- Check firewall/whitelist IP

### Lỗi CORS:
- Verify FRONTEND_URL trong backend environment
- Check REACT_APP_API_URL trong frontend
- Restart cả 2 services

### Lỗi 502 Bad Gateway:
- Backend chưa start xong (đợi 1-2 phút)
- Check backend logs
- Verify PORT environment variable

### Frontend không kết nối được Backend:
- Verify REACT_APP_API_URL đúng format: `https://backend.railway.app/api`
- Rebuild frontend sau khi thay đổi env
- Check browser console for errors

---

## 💰 Chi Phí Ước Tính

| Platform | Backend | Frontend | Database | Tổng/Tháng |
|----------|---------|----------|----------|------------|
| Railway | $5 credit | Included | Included | **$0** (trong credit) |
| Render | Free | Free | $0 (PostgreSQL) | **$0** |
| Vercel + Railway | $5 credit | Free | Included | **$0** |

**Lưu ý**: 
- Railway: $5 credit/tháng = ~500 giờ runtime (đủ cho dự án nhỏ)
- Render Free: Backend sleep sau 15 phút không dùng
- Cần upgrade nếu traffic cao

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề, check:
1. **Logs** trên hosting platform
2. **Environment Variables** đã đúng chưa
3. **Database connection** có hoạt động không
4. **CORS settings** giữa frontend và backend

Chúc bạn deploy thành công! 🎉
