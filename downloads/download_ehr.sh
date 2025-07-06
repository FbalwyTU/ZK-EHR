#!/bin/bash

# رابط مباشر لملف PDF تقريبي بحجم 1MB
URL="https://file-examples.com/wp-content/uploads/2017/10/file-sample_150kB.pdf"

# اسم الملف المطلوب بعد التنزيل
TARGET_NAME="ehr_annotated_1mb.pdf"

# تنزيل الملف مؤقتًا
curl -L -o temp.pdf "$URL"

# إعادة التسمية
mv temp.pdf "$TARGET_NAME"

# التأكيد
echo "تم تحميل الملف وإعادة تسميته إلى $TARGET_NAME"

