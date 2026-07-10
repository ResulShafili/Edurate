const transliteration: Record<string, string> = {
  ə: "e",
  ı: "i",
  ö: "o",
  ü: "u",
  ğ: "g",
  ş: "s",
  ç: "c",
  а: "a",
  ә: "e",
  б: "b",
  в: "v",
  г: "g",
  ғ: "g",
  д: "d",
  е: "e",
  ё: "yo",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  қ: "q",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  ө: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ү: "u",
  ф: "f",
  х: "x",
  һ: "h",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "shch",
  ъ: "",
  ы: "i",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

export function toSlug(value: string) {
  return Array.from(value.trim().toLocaleLowerCase("az"))
    .map((character) => transliteration[character] ?? character)
    .join("")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}
