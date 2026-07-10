# EduRate

EduRate Qarabağ Universiteti tələbələri üçün hazırlanmış akademik kampus platformasıdır. Layihənin məqsədi tələbələrin dərs, müəllim və material ehtiyaclarını tək bir rəqəmsal məkanda birləşdirməkdir.

Platforma tələbələrə universitet emaili ilə təhlükəsiz qeydiyyatdan keçmək, müəllimlər haqqında rəy bildirmək, fənlər üzrə sual-cavab aparmaq, konspekt və PDF materialları paylaşmaq imkanı verir.

## Texnologiyalar

EduRate modern full-stack arxitektura üzərində qurulub:

- **Next.js / React** - frontend tətbiqi və səhifə routing-i
- **Tailwind CSS** - premium, yığcam və responsive UI dizaynı
- **Lucide React** - ikonlar və vizual interfeys detalları
- **Node.js + Express** - REST API və backend servis strukturu
- **PostgreSQL** - relational database və modul əlaqələri
- **JWT Auth** - istifadəçi sessiyaları və qorunan endpoint-lər

## Əsas Modullar

### 1. Auth

Tələbələrin universitet emaili ilə qeydiyyatdan keçməsi və giriş etməsi üçün autentifikasiya modulu. Sistem universitet domainini yoxlayır və JWT vasitəsilə istifadəçi sessiyasını idarə edir.

### 2. Müəllim Rate

Tələbələr müəllimləri fənn üzrə qiymətləndirə, ulduz reytinqi verə və anonim rəy paylaşa bilirlər. Rəylərdə izah keyfiyyəti, çətinlik və obyektivlik kimi göstəricilər nəzərə alınır.

### 3. Q&A Forum

Fənlər üzrə sual-cavab mühiti. Tələbələr sual yarada, cavab yaza, nested thread şəklində müzakirə apara və faydalı cavablara səs verə bilirlər.

### 4. PDF Share

Konspekt, cheat sheet və dərs materiallarının paylaşılması üçün resurs modulu. Tələbələr PDF və şəkil tipli materialları fənlərə görə görə və yükləyə bilirlər.

## Layihə Strukturu

```text
Edurate/
  backend/    Node.js + Express API
  frontend/   Next.js + Tailwind frontend
  database/   PostgreSQL schema və migration faylları
```

## Demo Məlumatları

Backend daxilində demo seed skripti mövcuddur. Bu skript Qarabağ Universiteti, test tələbələri, müəllimlər, fənlər, rəylər, forum sualları və resurslar yaradır.

```bash
cd backend
npm run seed
```

Demo giriş:

```text
Email: test@karabakh.edu.az
Password: password123
```

## Məqsəd

EduRate Holberton School final layihəsi çərçivəsində hazırlanır və real kampus ehtiyaclarına uyğun, istifadəsi rahat, vizual olaraq təmiz və genişlənə bilən bir tələbə platforması kimi dizayn edilib.
