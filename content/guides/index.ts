import type { SurahGuide } from "@/content/types";

// Registry of all authored guides (content.ts keys them by meta.slug).
import s78 from "./78-an-naba";
import s79 from "./79-an-naaziaat";
import s80 from "./80-abasa";
import s81 from "./81-at-takwir";
import s82 from "./82-al-infitaar";
import s83 from "./83-al-mutaffifin";
import s84 from "./84-al-inshiqaaq";
import s85 from "./85-al-burooj";
import s86 from "./86-at-taariq";
import s87 from "./87-al-alaa";
import s88 from "./88-al-ghaashiya";
import s89 from "./89-al-fajr";
import s90 from "./90-al-balad";
import s91 from "./91-ash-shams";
import s92 from "./92-al-lail";
import s93 from "./93-ad-dhuhaa";
import s94 from "./94-ash-sharh";
import s95 from "./95-at-tin";
import s96 from "./96-al-alaq";
import s97 from "./97-al-qadr";
import s98 from "./98-al-bayyina";
import s99 from "./99-az-zalzala";
import s100 from "./100-al-aadiyaat";
import s101 from "./101-al-qaaria";
import s102 from "./102-at-takaathur";
import s103 from "./103-al-asr";
import s104 from "./104-al-humaza";
import s105 from "./105-al-fil";
import s106 from "./106-quraish";
import s107 from "./107-al-maaun";
import s108 from "./108-al-kawthar";
import s109 from "./109-al-kaafiroon";
import s110 from "./110-an-nasr";
import s111 from "./111-al-masad";
import s112 from "./112-al-ikhlaas";
import s113 from "./113-al-falaq";
import s114 from "./114-an-naas";

// Recommended Recitations collection
import gYasin from "./36-yasin";
import gMulk from "./67-al-mulk";
import gKahf from "./18-al-kahf-protection";
import gKursi from "./2-ayat-al-kursi";
import gBaqarah from "./2-al-baqarah-last-2";

export const guides: SurahGuide[] = [
  s78, s79, s80, s81, s82, s83, s84, s85, s86, s87, s88, s89, s90, s91, s92,
  s93, s94, s95, s96, s97, s98, s99, s100, s101, s102, s103, s104, s105, s106,
  s107, s108, s109, s110, s111, s112, s113, s114,
  gYasin, gMulk, gKahf, gKursi, gBaqarah,
];
