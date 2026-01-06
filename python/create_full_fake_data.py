# python/create_full_fake_data.py
# BẢN FULL 2025 – 100 USERS + 1000 POSTS + ẢNH THẬT TỪ LOREMFLICKR

import os
import random
import requests
import mysql.connector
from datetime import datetime, timedelta
from tqdm import tqdm
import time

# ===================== CẤU HÌNH =====================
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "",
    "database": "social_app",
    "port": 3306
}

# ĐƯỜNG DẪN TỰ ĐỘNG
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)
IMAGE_FOLDER = os.path.join(PROJECT_ROOT, "backend", "src", "public", "image", "posts")

# Tạo thư mục nếu chưa có
os.makedirs(IMAGE_FOLDER, exist_ok=True)

print("=" * 80)
print("🔍 KIỂM TRA ĐƯỜNG DẪN:")
print(f"📂 File Python: {BASE_DIR}")
print(f"📂 Project root: {PROJECT_ROOT}")
print(f"📁 Thư mục ảnh: {IMAGE_FOLDER}")
print(f"✅ Tồn tại: {os.path.exists(IMAGE_FOLDER)}")
print(f"✅ Quyền ghi: {os.access(IMAGE_FOLDER, os.W_OK)}")
print("=" * 80)

# ===================== TÊN NGƯỜI DÙNG =====================
FIRST_NAMES = [
    "Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Vũ", "Đặng",
    "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý", "An", "Bình", "Cường",
    "Dũng", "Hải", "Khánh", "Minh", "Nam", "Phong", "Tuấn", "Quân",
    "Kiên", "Long", "Khoa", "Khôi", "Huy", "Đức", "Đạt", "Tùng",
    "Sơn", "Phúc", "Thịnh", "Bảo", "Việt", "Hiếu"
]

LAST_NAMES = [
    "Anh", "Bảo", "Cúc", "Đào", "Hà", "Lan", "Linh", "Mai", "Ngọc",
    "Oanh", "Phương", "Quỳnh", "Thư", "Trang", "Vy", "Yến", "Huyền",
    "My", "Nhi", "Thảo", "Tâm", "Hương", "Chi", "Kiều", "Duyên"
]

# ===================== NỘI DUNG BÀI POST =====================
CONTENTS = [
    ["Sáng nay dậy sớm đi cà phê một mình, chill phết", "coffee", "morning"],
    ["Trời Sài Gòn mưa to quá, ai cũng ướt như chuột lột", "saigon", "rain"],
    ["Cuối tuần này đi Đà Lạt không cả nhà ơi??", "dalat", "travel"],
    ["Ai bán bánh tráng trộn gần đây không chỉ em với", "food", "streetfood"],
    ["Mới mua con mèo Ba Tư về, cute xỉu", "cat", "pet"],
    ["Tập gym 3 tháng rồi mà vẫn chưa thấy múi nào", "gym", "fitness"],
    ["Hôm nay được nghỉ làm, nằm nhà xem Netflix cả ngày", "netflix", "chill"],
    ["Việt Nam vô địch SEA Games 32 rồi anh em ơi!!!", "vietnam", "football"],
    ["Ai biết quán bún bò Huế ngon ở quận 7 không ạ?", "food", "bunbo"],
    ["Tối nay đi nhậu không anh em? Em khao", "beer", "party"],
    ["Mới đổi iPhone 16 Pro Max, xài thích thật sự", "iphone", "tech"],
    ["Đang nghe nhạc Chill với loa JBL, phê quá", "music", "chill"],
    ["Ai đang học code thì giơ tay", "coding", "developer"],
    ["Hôm nay trời đẹp quá, phải đi dạo mới được", "weather", "sunny"],
    ["Mới cắt tóc ngắn, mọi người thấy sao?", "hair", "style"],
    ["Đang xem phim kinh dị một mình, sợ quá", "horror", "movie"],
    ["Ai bán đồ secondhand đẹp chỉ em với", "fashion", "shopping"],
    ["Mới mua thêm 3 cây về trồng, nhà thành rừng luôn", "plant", "green"],
    ["Tối nay ăn lẩu bò nhé cả nhà?", "food", "hotpot"],
    ["Đang học tiếng Anh, ai học cùng không?", "english", "study"],
    ["Hôm nay đi chợ Bến Thành mua đồ, đông như kiến", "shopping", "saigon"],
    ["Mới xem concert Sơn Tùng MTP, đỉnh quá trời", "concert", "music"],
    ["Ai rủ đi ăn buffet lẩu Kichi Kichi không?", "buffet", "food"],
    ["Đêm qua mất ngủ vì hàng xóm ồn quá", "sleep", "night"],
    ["Mới đi cắm trại ở Mộc Châu, view đẹp mê ly", "camping", "nature"],
    ["Ai biết quán trà sữa ngon ở Hà Nội không ạ?", "drink", "hanoi"],
    ["Tối nay trận Việt Nam vs Thái Lan, xem ở đâu?", "football", "sport"],
    ["Vừa ăn xong tô phở bò 100k, ngon xuất sắc", "pho", "food"],
    ["Mới mua con chó Golden về nuôi, đáng yêu lắm", "dog", "pet"],
    ["Ai đã đi Phú Quốc chưa? Có gì hay không ạ?", "phuquoc", "travel"],
    ["Hôm nay nghỉ làm ở nhà chơi game cả ngày", "gaming", "weekend"],
    ["Mới học xong khóa Python, hứng thú quá", "python", "coding"],
    ["Ai biết tiệm nail đẹp ở quận 1 không ạ?", "nail", "beauty"],
    ["Tối nay đi bar ở Bùi Viện không mọi người?", "bar", "nightlife"],
    ["Mới mua váy mới, iu quá trời iu đất", "fashion", "dress"],
    ["Ai đang chơi Liên Quân Mobile không?", "gaming", "mobile"],
    ["Đang ăn kiêng giảm cân, khổ quá anh em ơi", "diet", "fitness"],
    ["Vừa đi spa xong, da mướt mịn lắm luôn", "spa", "beauty"],
    ["Ai rủ đi karaoke tối nay không?", "karaoke", "singing"],
    ["Mới về Huế ăn bún bò, nhớ quá đi", "hue", "food"],
    ["Đang nghe nhạc Indie, phê vcl", "indie", "music"],
    ["Ai biết quán ăn chay ngon ở Sài Gòn không?", "vegetarian", "food"],
    ["Tối nay xem phim Marvel mới, ai đi cùng?", "marvel", "cinema"],
    ["Mới tậu xe SH Mode mới, đẹp xuất sắc", "motorbike", "vehicle"],
    ["Ai đang học IELTS giơ tay", "ielts", "english"],
    ["Hôm nay trời nóng 40 độ, ai chịu nổi", "hot", "weather"],
    ["Mới ăn xong tô bún riêu, đã quá", "food", "vietnamese"],
    ["Ai biết shop giày fake ngon ở đâu không?", "shoes", "shopping"],
    ["Đêm qua đi bar Pearl, vui phết", "bar", "party"],
    ["Mới học xong lái xe, ai rủ đi chơi", "driving", "car"],
    ["Ai thích uống trà đá vỉa hè không?", "drink", "street"],
    ["Tối nay đi ăn vịt quay Lạng Sơn nhé", "food", "duck"],
    ["Mới mua điện thoại Samsung mới, xài ngon", "samsung", "tech"],
    ["Ai biết quán massage bấm huyệt ở đâu không?", "massage", "relax"],
    ["Đang học Photoshop, khó quá trời", "design", "photoshop"],
    ["Ai rủ đi biển Vũng Tàu cuối tuần này?", "beach", "travel"],
    ["Mới ăn xong tô mì Quảng, ngon tuyệt vời", "food", "noodles"],
    ["Ai đang xem phim Hàn Quốc không?", "kdrama", "movie"],
    ["Hôm nay đi siêu thị mua đồ, tốn hết tiền", "shopping", "market"],
    ["Mới học xong yoga, thấy khỏe hơn nhiều", "yoga", "health"],
    ["Ai biết quán bánh xèo ngon ở Hội An không?", "food", "hoian"],
    ["Tối nay đi xem xiếc không anh em?", "circus", "entertainment"],
    ["Mới về quê ăn cơm mẹ nấu, nhớ quá", "home", "family"],
    ["Ai thích chơi cầu lông không?", "badminton", "sport"],
    ["Đang nghe podcast về khởi nghiệp, hay lắm", "podcast", "business"],
    ["Mới mua sách mới về đọc, thích quá", "book", "reading"],
    ["Ai biết quán bún chả Hà Nội ngon không?", "food", "hanoi"],
    ["Tối nay đi chơi công viên Tao Đàn nhé", "park", "outdoor"],
    ["Mới tập boxing, mệt nhưng vui", "boxing", "sport"],
    ["Ai thích uống cà phê sữa đá không?", "coffee", "vietnamese"],
    ["Đang xem Youtube về du lịch, muốn đi quá", "youtube", "travel"],
    ["Mới ăn xong gỏi cuốn, thanh mát vcl", "food", "fresh"],
    ["Ai biết shop quần áo local brand đẹp không?", "fashion", "local"],
    ["Hôm nay đi chùa cầu may, mong mọi thứ tốt đẹp", "temple", "spiritual"],
    ["Mới tậu laptop mới để code, mượt quá", "laptop", "coding"],
    ["Ai thích ăn chè không? Em mê lắm", "dessert", "sweet"],
    ["Tối nay đi ăn nướng BBQ không mọi người?", "bbq", "food"],
    ["Mới đi leo núi Bà Đen, mệt nhưng đáng", "hiking", "mountain"],
    ["Ai biết quán cà phê view đẹp ở Đà Nẵng không?", "coffee", "danang"],
    ["Đang học guitar, ngón tay đau quá", "guitar", "music"],
    ["Mới xem show Rap Việt, đỉnh của chóp", "rap", "music"],
    ["Ai thích ăn bánh mì pate không?", "banhmi", "food"],
    ["Hôm nay được boss khen, vui quá trời", "work", "happy"],
    ["Mới đi chơi Landmark 81, cao vcl", "landmark", "saigon"],
    ["Ai biết shop mỹ phẩm xịn ở đâu không?", "cosmetic", "beauty"],
    ["Tối nay đi chợ đêm Đà Lạt nhé", "market", "dalat"],
    ["Mới tập dance, vui mà mệt lắm luôn", "dance", "sport"],
    ["Ai thích ăn hải sản không? Đi ăn cùng", "seafood", "food"],
    ["Đang xem anime One Piece, nghiện quá", "anime", "manga"],
    ["Mới mua nón bảo hiểm mới, đẹp xuất sắc", "helmet", "safety"],
    ["Ai biết quán sushi ngon ở Hà Nội không?", "sushi", "japanese"],
    ["Hôm nay đi tập Muay Thái, sướng người", "muaythai", "sport"],
    ["Mới ăn xong tô bún đậu mắm tôm, đã lắm", "food", "vietnamese"],
    ["Ai thích nghe nhạc US-UK không?", "music", "international"],
    ["Tối nay đi xem bóng rổ NBA không?", "basketball", "sport"],
    ["Mới về thăm Huế, thành phố yên bình quá", "hue", "travel"],
    ["Ai biết quán ốc ngon ở Sài Gòn không?", "seafood", "food"],
    ["Đang học tiếng Nhật, khó vcl", "japanese", "language"],
    ["Mới tậu áo khoác hoodie mới, ấm áp", "hoodie", "fashion"],
]

# ===================== CHỦ ĐỀ ẢNH (dùng cho LoremFlickr) =====================
IMAGE_KEYWORDS = [
    "nature", "city", "food", "coffee", "travel", "beach", "mountain",
    "cat", "dog", "fitness", "gym", "car", "motorbike", "fashion",
    "technology", "computer", "phone", "music", "party", "sunset"
]

# ===================== TẢI ẢNH =====================
def download_image(url, filepath, max_retries=3):
    """Tải ảnh từ URL với retry"""
    for attempt in range(max_retries):
        try:
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
            r = requests.get(url, headers=headers, timeout=30, allow_redirects=True)
            
            if r.status_code == 200 and len(r.content) > 5000:  # Ít nhất 5KB
                with open(filepath, "wb") as f:
                    f.write(r.content)
                
                if os.path.exists(filepath) and os.path.getsize(filepath) > 5000:
                    return True
            
            time.sleep(1)  # Chờ 1s trước khi retry
            
        except Exception as e:
            if attempt == max_retries - 1:
                print(f"\n❌ Lỗi tải ảnh sau {max_retries} lần thử: {e}")
            time.sleep(2)
    
    return False

# ===================== BẮT ĐẦU =====================
print("\n🔌 Đang kết nối database...")
try:
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()
    print("✅ Kết nối database thành công!")
except Exception as e:
    print(f"❌ Lỗi kết nối database: {e}")
    exit(1)

# ===================== TẠO 100 USERS =====================
# print("\n👤 Đang tạo 100 users...")
# for i in tqdm(range(1, 101), desc="Users"):
#     name = random.choice(FIRST_NAMES) + " " + random.choice(LAST_NAMES)
#     email = f"user{i}@fake.com"
#     password = "$2b$10$fakehashedpassword1234567890"
#     avatar = f"https://i.pravatar.cc/400?u=user{i}"

#     cursor.execute("""
#         INSERT IGNORE INTO users (id, name, email, password, image_url, createdAt, updatedAt)
#         VALUES (%s, %s, %s, %s, %s, NOW(), NOW())
#     """, (i, name, email, password, avatar))

# conn.commit()
# print("✅ Đã tạo 100 users!")

# # Lấy danh sách user IDs
# cursor.execute("SELECT id FROM users")
user_ids = [row[0] for row in cursor.fetchall()]
# print(f"📋 Có {len(user_ids)} users trong database")

# ===================== TẠO 1000 POSTS + ẢNH =====================
print("\n📝 Đang tạo 1000 bài viết + ảnh từ LoremFlickr...")
success_count = 0
fail_count = 0
image_success = 0
image_fail = 0

for post_num in tqdm(range(1, 20), desc="Posts"):
    try:
        uid = random.choice(user_ids)
        ct = random.choice(CONTENTS)
        content = ct[0]
        tags = ct[1:]
        content += " " + " ".join([f"#{t}" for t in tags])
        
        created_at = datetime.now() - timedelta(days=random.randint(0, 60))

        cursor.execute("""
            INSERT INTO posts (user_id, content, privacy, created_at)
            VALUES (%s, %s, 'public', %s)
        """, (uid, content, created_at))

        post_id = cursor.lastrowid

        # Chọn keyword ngẫu nhiên cho ảnh
        keyword = random.choice(IMAGE_KEYWORDS)
        img_count = random.randint(1, 4)  # 1-4 ảnh mỗi post

        for i in range(img_count):
            # LoremFlickr URL
            url = f"https://loremflickr.com/900/1200/{keyword}?random={post_id}_{i}"
            filename = f"post_{post_id}_{i}.jpg"
            filepath = os.path.join(IMAGE_FOLDER, filename)

            if download_image(url, filepath):
                media_url = f"/image/posts/{filename}"
                cursor.execute("""
                    INSERT INTO post_media (post_id, media_url, media_type)
                    VALUES (%s, %s, 'image')
                """, (post_id, media_url))
                image_success += 1
            else:
                image_fail += 1

        conn.commit()
        success_count += 1
        time.sleep(0.2)  # Chờ 200ms giữa các post

    except Exception as e:
        fail_count += 1
        print(f"\n❌ Lỗi ở post {post_num}: {e}")
        conn.rollback()

# ===================== HOÀN THÀNH =====================
print("\n" + "=" * 80)
print("🎉 HOÀN THÀNH!")
print("=" * 80)
print(f"👥 Users: 100")
print(f"📝 Posts thành công: {success_count}")
print(f"📝 Posts thất bại: {fail_count}")
print(f"🖼️  Ảnh tải thành công: {image_success}")
print(f"🖼️  Ảnh thất bại: {image_fail}")
print(f"📁 Thư mục ảnh: {IMAGE_FOLDER}")
print(f"💾 Database: {DB_CONFIG['database']}")
print("=" * 80)

conn.close()
print("🔒 Đã đóng kết nối database!\n")