import type { Store } from "./types";

/**
 * The mall's shops, as the Matterport scans actually carry them.
 *
 * NOT hand-written brand copy. Every entry here corresponds to a pin present
 * in one of the two models — `tagId` is that pin — and the gallery and links
 * are the pin's own attachments and calls to action, read out of the model
 * through the Showcase SDK. There is no stock photography and no invented
 * price: a photo here is a photo the mall itself put on the shopfront.
 *
 * The previous catalogue (ZARA, FLO, GUESS, BIRKENSTOCK, MANGO, SEPHORA, Nike,
 * PAUL) was placeholder fiction — none of those eight is pinned in either
 * scan, so the directory described a mall that does not exist.
 *
 * `description` and `category` are the only authored fields, and they stay
 * deliberately thin. Where the trade is evident — from the brand's own domain,
 * or from the pin's label — it is stated. Where it is not (RAZANA, LNKO,
 * DUO ZOU LU, ROSABELLA, ALTI) the entry says where the shop is and where to
 * buy, and claims nothing about what it sells. A wrong fact about a real
 * business is worse than a thin one.
 *
 * Adding a shop is a Matterport Workshop job: tag it, re-run the probe, add a
 * line here. Order is alphabetical so the rail does not reshuffle.
 */
export const STORES: Store[] = [
  {
    slug: "alti",
    name: "ALTI",
    tagId: "ThXG1FnI6WF",
    level: "N1",
    category: "Boutique",
    description:
      "Enseigne du premier étage. Commande en ligne sur annakhil.alti.ma.",
    gallery: [
      "https://cdn-2.matterport.com/attachments/7ucg7dthffi5rfxuep37sh8za/IMG_20260625_115238.jpg?t=2-54fddf4bd3d5c2deb07163b70fc8b4ac921d4e61-1787346430-1",
      "https://cdn-2.matterport.com/attachments/bqf4znumsf02acp2negb818xd/IMG_20260625_115122.jpg?t=2-fbf2b1eff0fdb2f91561ca4eaf6aca6b4af4cbdd-1787346430-1",
      "https://cdn-2.matterport.com/attachments/18qg9zui0nmyxdx3rxt0x5fsb/IMG_20260625_115145.jpg?t=2-ec21b247da0494de5ea096664212fac89f6a9685-1787346430-1",
      "https://cdn-2.matterport.com/attachments/xriz8mmg5s6kqdgk145emg35d/IMG_20260625_115008.jpg?t=2-3a39c06a671c0064781a63484d1da3513cb951f0-1787346430-1",
      "https://cdn-2.matterport.com/attachments/p3xg63tgadyer73cmhh6mny7b/IMG_20260625_115037.jpg?t=2-3d0192cad5d086e62cf1ab52042700fb6ad9a3af-1787346430-1",
      "https://cdn-2.matterport.com/attachments/wg4qqr6tczhkd3h47zgmqg5tb/IMG_20260625_115057.jpg?t=2-ef649227e43bab5f53d2eed24814086dfc08322b-1787346430-1",
      "https://cdn-2.matterport.com/attachments/4yb6kq98x0m1r7aqe8d5tt7pc/IMG_20260625_115208.jpg?t=2-fc789656c78e36ced5bdcbe866ce4e39dbc3b5b4-1787346430-1",
    ],
    links: [
      { label: "Commandez en ligne", href: "https://annakhil.alti.ma/?utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAZXh0bgNhZW0CMTEAc3J0YwZhcHBfaWQPNTY3MDY3MzQzMzUyNDI3AAGnvXXgEkyvtmcCTohcQjb5ElsHYG8j-jFJeqqxWt1IQ-CnQ3eERMOQ8vyX_Bk_aem_JvSHgAmoRh7aPBacg6SpUA" },
    ],
  },
  {
    slug: "duo-zou-lu",
    name: "DUO ZOU LU",
    tagId: "q8rSn6hrk59",
    level: "N0",
    category: "Boutique",
    description:
      "Enseigne du rez-de-chaussée. Boutique en ligne sur duozoulu.ma.",
    gallery: [
      "https://cdn-2.matterport.com/attachments/zwbg7gd2w69rxpgbpwugpt3bb/logo-1726946676.jpg?t=2-980034f104a83624a71465118f3855015ddd598d-1787346256-1",
      "https://cdn-2.matterport.com/attachments/x8rd0t8w5qcnirmw13gb0unqc/1024-1535.jpg?t=2-70aa02c80db9597ac50cf20bb0717c9d258eaa4e-1787346256-1",
      "https://cdn-2.matterport.com/attachments/15kkeisiu0q1e3uhziq6p1ktd/4096-2732-max-min.jpg?t=2-50bca4e65dac45f3a4b1629a6440a889a7591311-1787346256-1",
      "https://cdn-2.matterport.com/attachments/4pefwxia8zmk4abq2xyxn54uc/0428DUOZOULU-2057-__.jpg?t=2-eab857ee8caeae6d9105b88ece445b1849fba126-1787346256-1",
      "https://cdn-2.matterport.com/attachments/e5pbpyre473w16re9mcat9dbd/0428DUOZOULU-602-__.jpg?t=2-b40a1bb74569e540ab91d448ab87f8ea55923020-1787346256-1",
    ],
    links: [
      { label: "Acheter en ligne", href: "https://www.duozoulu.ma/" },
    ],
  },
  {
    slug: "electroplanet",
    name: "ELECTROPLANET",
    tagId: "fMYgXDwz76E",
    level: "N0",
    category: "Électronique",
    description:
      "Électroménager et électronique grand public. Sa fiche dans le mall propose l'achat en ligne et un chèque cadeau à offrir.",
    gallery: [
      "https://cdn-2.matterport.com/attachments/87k9spncnr0k9yckx71irpkbb/Bon-d_achat-digital_2.jpg?t=2-f561d2335b7b6c223bc46fc2ee3dbf72cdefc260-1787346256-1",
      "https://cdn-2.matterport.com/attachments/yh405h7m93ud5d7afy3cic9fd/clim_1.jpg?t=2-f54049bebabbda11e67f816237aedf6c7f9ca53e-1787346256-1",
      "https://cdn-2.matterport.com/attachments/zf2r50545scwuwkcb441dw4hc/Artboard_1_copie_2.png?t=2-743ea5f10f6e094ac5a93e4b87276ab853bc85fe-1787346256-1",
      "https://cdn-2.matterport.com/attachments/0z8tzw27ttmx9ywaurbu10g7d/OCEAN_COMB_CNFIOS400MA_450L_NFINVERS_CLASSE_A_SLIM_OCEA_.png?t=2-6af80dc39a86849efd7aa768c3974bb1fc25416e-1787346256-1",
      "https://cdn-2.matterport.com/attachments/5wn742mpwkkdshtyi8fy34eda/HP_Banner_6_.jpg?t=2-cb383a9485411e0146c1ccd50cdb2eaf415939c4-1787346256-1",
      "https://cdn-2.matterport.com/attachments/rkrphmbwy7twi0fdgf6uyu8kb/MEGA_LIFE_CLIM18VERSATY_DC_INVERTER_AIML18VERMGWTN_UMEGALIF_.png?t=2-5de0d32c14668de5a3854683c67c1c5fed10bc5c-1787346256-1",
      "https://cdn-2.matterport.com/attachments/g57ksgmrc5fy71smnrfzbauxd/HISENSE_CLIM_AS-12UW4RYRCA03_12000BTU_HISENSE_.png?t=2-4f116e202b727d08c6923a0a840582902132d8e7-1787346256-1",
      "https://cdn-2.matterport.com/attachments/4wprmn6aw3gtd26qqz8y6r67c/Artboard_1_copie_3.png?t=2-126e294953df9409c7f2738663482dd9a4b79b17-1787346256-1",
    ],
    links: [
      { label: "Offrez un Chèque Cadeau", href: "https://bondigit.electroplanet.ma/" },
      { label: "Acheter en ligne", href: "https://www.electroplanet.ma/" },
    ],
  },
  {
    slug: "faces",
    name: "FACES",
    tagId: "DoeSvSNvzc5",
    level: "N0",
    category: "Beauté",
    description:
      "Beauté et cosmétiques, avec achat en ligne depuis sa fiche.",
    gallery: [
      "https://cdn-2.matterport.com/attachments/ueu7as0t6fp6f8mimp6m2n9sd/la-franchise-faces-maintenant.jpg?t=2-4a4ac562731c0ff6495c3714362ae9d9f52a4629-1787346256-1",
      "https://cdn-2.matterport.com/attachments/inwc2yx14e8szf8sh7gr28w5a/Banniere_Givenchy1080_1350_px_2.webp?t=2-aca1d624fa2fe1accae0a49faa5511285819e476-1787346256-1",
      "https://cdn-2.matterport.com/attachments/30heekkn5u89dq3u56g30dn2c/Hero_Banner_copie_1_.webp?t=2-aa4aaf9ed3cd225c8c0903524ec012386ede89a9-1787346256-1",
      "https://cdn-2.matterport.com/attachments/z4c2zt3pd511czwhpub091f6b/HERO_BANNER_1_.webp?t=2-2862a219481a3eef1656c751a64c582ff7256c97-1787346256-1",
    ],
    links: [
      { label: "Acheter en ligne", href: "https://facesbeauty.ma/" },
    ],
  },
  {
    slug: "chocorico",
    name: "La Table de Chocorico",
    tagId: "ANz85A7Xs1n",
    level: "N1",
    category: "Alimentation",
    description:
      "Restauration au premier étage.",
    gallery: [
      "https://cdn-2.matterport.com/attachments/h7rmqbq7saan7y34rc2hx3dua/WhatsApp_Image_2026-06-29_at_20.43.48.jpeg?t=2-63599ea55332f43c17e45c45159759d2397549a5-1787346430-1",
      "https://cdn-2.matterport.com/attachments/hen79bpa5sw8hefccpepyx6yc/WhatsApp_Image_2026-06-29_at_20.43.21__1_.jpeg?t=2-a35ecf4a3f7a8e4ca9990feb2c37baeab51d5d01-1787346430-1",
      "https://cdn-2.matterport.com/attachments/w5tane432zccaz19kdwcg52ta/WhatsApp_Image_2026-06-29_at_20.43.21.jpeg?t=2-5dbd4358daf098292a83b60425430d67729d1059-1787346430-1",
      "https://cdn-2.matterport.com/attachments/ygbhc34rnp9fwr6scwm7p0ipc/WhatsApp_Image_2026-06-29_at_20.43.22__4_.jpeg?t=2-f8feca5321a73745e2a16fa1f70f3e50b641f2e3-1787346430-1",
      "https://cdn-2.matterport.com/attachments/0fi0au4as2pukgzf80pn81ebb/WhatsApp_Image_2026-06-29_at_20.43.22.jpeg?t=2-a8f722d0010705e0a8e09d8a9f578438877eaf2f-1787346430-1",
      "https://cdn-2.matterport.com/attachments/sxb26e801093b3fqt061a5cfd/WhatsApp_Image_2026-06-29_at_20.43.22__3_.jpeg?t=2-cb84e37b344435861969d182634e786db38f5f8a-1787346430-1",
      "https://cdn-2.matterport.com/attachments/k1w6uumy4i95ws3p70wxct92d/WhatsApp_Image_2026-06-29_at_20.43.22__5_.jpeg?t=2-953560cb41ed8c7cf7f3700855de02dbff30b06e-1787346430-1",
      "https://cdn-2.matterport.com/attachments/wz11f6msi0t60zy2zzb528ffd/WhatsApp_Image_2026-06-29_at_20.43.22__1_.jpeg?t=2-2f16c48a92763d1ba41fae676e928f3d2ac5fd0d-1787346430-1",
      "https://cdn-2.matterport.com/attachments/i86rg4xkapw0naqsbcs3hbx6c/WhatsApp_Image_2026-06-29_at_20.43.22__2_.jpeg?t=2-dcc42908d9c37d1ebe73a46228ee63052d9728e7-1787346430-1",
      "https://cdn-2.matterport.com/attachments/br8cypk0pe70wapi4e94hnfrb/WhatsApp_Image_2026-06-29_at_20.43.21__2_.jpeg?t=2-ae9800409307f30c6417754977b52b397450728c-1787346430-1",
    ],
    links: [
      { label: "Instagram", href: "https://www.instagram.com/chocorico_officiel?igsh=MXB0YjJrdW5sanUweA==" },
    ],
  },
  {
    slug: "carrousel",
    name: "LES UNIVERS DU CARROUSEL",
    tagId: "tpuUU2ub90Z",
    level: "N0",
    category: "Animation",
    description:
      "Espace d'animation du mall. Sa fiche porte l'une des questions du parcours.",
    gallery: [
      // aucune photo sur ce pin
    ],
    links: [
      { label: "Questions Food", href: "https://my.matterport.com/show/?m=UjnosRzGqQH&ss=15&sr=.12,-1" },
    ],
  },
  {
    slug: "lnko",
    name: "LNKO",
    tagId: "bRWbYMBjBgQ",
    level: "N0",
    category: "Boutique",
    description:
      "Enseigne du rez-de-chaussée. Boutique en ligne sur lnkobrand.com.",
    gallery: [
      "https://cdn-2.matterport.com/attachments/26bgqs66k6twtx74t2f58hhnc/3_13ce7541-8fed-4d35-b3e4-74d2b439230f.webp?t=2-2c8becf7705ca741240cf8a38a7940562b5e26ad-1787346256-1",
      "https://cdn-2.matterport.com/attachments/zrs5rqdrgq5gb8sxiadwhyz5a/760379677_18121620316833413_6866744359831414141_n.jpg?t=2-c98b0205b16b15e02966b46028107cc775a1cb5c-1787346256-1",
      "https://cdn-2.matterport.com/attachments/sg0t12f80hwueqe3t117h3z8a/WhatsApp_Image_2025-05-13_at_22.54.45_1.webp?t=2-92c632cf1879405697e7560615a30fea01d8a0b6-1787346256-1",
      "https://cdn-2.matterport.com/attachments/e8k7cw5drwnxsudfdpxi0p77d/IMG_2392.webp?t=2-c1a1dbf7f177ace347036c5d371b6da3edc560b8-1787346256-1",
      "https://cdn-2.matterport.com/attachments/idw6ssz92hiy47etdkm8hqapc/769484086_18122578939833413_7049109731535962055_n.jpg?t=2-13d77e946f0474cb6f64b52f98c13f134e541cca-1787346256-1",
      "https://cdn-2.matterport.com/attachments/tkugbzgeei2khd30btq7n34ua/5O1A2951.webp?t=2-729f7bcb1a3d57bb520d794e47d8cf2f36d17426-1787346256-1",
    ],
    links: [
      { label: "Acheter en ligne", href: "https://lnkobrand.com/" },
    ],
  },
  {
    slug: "maki-mac",
    name: "MAKI MAC",
    tagId: "mwrHByPH2fP",
    level: "N1",
    category: "Alimentation",
    description:
      "Restauration au premier étage. Commandes au 05375-80993.",
    gallery: [
      "https://cdn-2.matterport.com/attachments/5brz6kbdk10md90ep6bc2a4nc/WhatsApp_Image_2026-06-22_at_22.06.09__1_.jpeg?t=2-4c21516d1e4fc1ebb8f7edb3b33b79567efbc6f9-1787346430-1",
      "https://cdn-2.matterport.com/attachments/za00i96m3m6isz7fpf0q70q4b/WhatsApp_Image_2026-06-22_at_22.06.10__3_.jpeg?t=2-17c98dc90f672b8a67c79f0b1cbbfe547065d2b2-1787346430-1",
      "https://cdn-2.matterport.com/attachments/09yhqzm2x59s2mfhzh6c4crnc/WhatsApp_Image_2026-06-22_at_22.06.10__2_.jpeg?t=2-09d9c46f7897b9e3b5c99a153daea4387a9a509c-1787346430-1",
      "https://cdn-2.matterport.com/attachments/3z7kbzqw29x54amia1fmwx5na/WhatsApp_Image_2026-06-22_at_22.06.04.jpeg?t=2-f56f574772ae81517970a976dd4515ef56474e4e-1787346430-1",
      "https://cdn-2.matterport.com/attachments/gbre4ap8ekdt770zk6p258fzb/WhatsApp_Image_2026-06-22_at_22.06.10.jpeg?t=2-dd8f27db564af283f5005d4963454367dd4289de-1787346430-1",
      "https://cdn-2.matterport.com/attachments/pab3zz7243c91xa3ubxiisi2d/WhatsApp_Image_2026-06-22_at_22.06.10__1_.jpeg?t=2-90e8e7e265a60e55e8e0a5ef2c9d51e59306ab40-1787346430-1",
      "https://cdn-2.matterport.com/attachments/gear4pc3mzku3eif6nh2a4frc/WhatsApp_Image_2026-06-22_at_22.06.09.jpeg?t=2-6e0a116c482bfe23a5f5e2fc7549d47797a0cfd4-1787346430-1",
      "https://cdn-2.matterport.com/attachments/nfgncdabi6dxcgdffnek9908c/WhatsApp_Image_2026-06-22_at_22.06.09__2_.jpeg?t=2-66e72183b0e15315400dd19340bb674338fa02b3-1787346430-1",
    ],
    links: [
      { label: "Instagram", href: "https://www.instagram.com/makimacofficiel/?hl=fr" },
      { label: "Facebook", href: "https://www.facebook.com/Benbrahimevents/?locale=fr_FR" },
    ],
  },
  {
    slug: "planet-sport",
    name: "PLANET SPORT",
    tagId: "pcCTcOSm8qW",
    level: "N0",
    category: "Sport",
    description:
      "Articles et équipements de sport, avec achat en ligne depuis sa fiche.",
    gallery: [
      "https://cdn-2.matterport.com/attachments/zn9hpi4wkme23q8rktexydxxb/28db5b5cb7e3e55ca275feef1603a6181ad5f260_SLIDE.jpg.jpeg?t=2-59e2c2958610e5249f4d199653d82b5df8fed82a-1787346256-1",
      "https://cdn-2.matterport.com/attachments/u14k7ncra5hcn2a0ksa6i6w6a/Capture_d__cran_2026-08-10_180919.png?t=2-e0f1b338434d6b885fbc426b28b761bac2c6562f-1787346256-1",
      "https://cdn-2.matterport.com/attachments/28h4u2zmm5k6s1xy0emkwb29c/Capture_d__cran_2026-08-10_180734.png?t=2-ef8ebe35e9a3c9b9e16c6b0f14e285a72149e429-1787346256-1",
      "https://cdn-2.matterport.com/attachments/2wkt5ck2ktg4b8xkxrc7zt59c/Capture_d__cran_2026-08-10_181058.png?t=2-346951e8b04c260e6d15861e75b318b967d0d1bb-1787346256-1",
      "https://cdn-2.matterport.com/attachments/9f58nhrq0hri5cnwh4funiksa/planetsport_-_logo.png?t=2-bd2d315c937d626ad3557ed5ed193a06cf6271ce-1787346256-1",
    ],
    links: [
      { label: "Acheter en ligne", href: "https://planetsport.ma/" },
    ],
  },
  {
    slug: "razana",
    name: "RAZANA",
    tagId: "U3Hu6KI2VPF",
    level: "N0",
    category: "Boutique",
    description:
      "Enseigne du rez-de-chaussée. Sa collection été 2026 est en ligne sur razana.com.",
    gallery: [
      "https://cdn-2.matterport.com/attachments/xiq6mertcnrscu6misy7c4f4c/161.jpg?t=2-edf824b1ec40ecc97d99bfc130a686ab425feead-1787346256-1",
      "https://cdn-2.matterport.com/attachments/0teif75mte842nwekfa2nxssd/Robe_chemise_fluide_imprim_floral_turquoise.webp?t=2-14ec8763c89d4b728841b24e404893b3e343e714-1787346256-1",
      "https://cdn-2.matterport.com/attachments/hkwrzw6q3n5s9fnp5m0r8ugya/images__3_.jpg?t=2-23be3cb4fd99fd5eaef0870c8ac45dd696a93ad4-1787346256-1",
      "https://cdn-2.matterport.com/attachments/1ixdsgi95rehg7h4icgtdg57b/Chemise_en_lin_-Vert_kaki-face-femme_RAZANA_c5a3963f-6322-476a-8e9b-a163514e7cc4.webp?t=2-07e51172add02aa3dbb1b2b4eba045837dcff951-1787346256-1",
      "https://cdn-2.matterport.com/attachments/che2wc5ca2nfpsrxteyine3tc/181.jpg?t=2-a55f9db4f14640b761c4a6333d0887d36501751c-1787346256-1",
      "https://cdn-2.matterport.com/attachments/0t7t4t53q4n6kuhcpuek1aiza/nsemble-long-asymetrique-satine-rose-face-razana2.webp?t=2-ec14b599540ede45a8b90589add075418a33c065-1787346256-1",
      "https://cdn-2.matterport.com/attachments/1m3qtszbs1cktc8cmaqn7yr2a/Chemise_longue_fluide_femme.webp?t=2-26ef64150e40dcf12dd324765c3eb8383bd5b426-1787346256-1",
    ],
    links: [
      { label: "Acheter en ligne", href: "https://razana.com/collections/collection-ete-2026" },
    ],
  },
  {
    slug: "rosabella",
    name: "ROSABELLA",
    tagId: "IRMnDl2ye5n",
    level: "N0",
    category: "Boutique",
    description:
      "Enseigne du rez-de-chaussée. Boutique en ligne sur rosabella.ma.",
    gallery: [
      "https://cdn-2.matterport.com/attachments/w0ubaa4ufqwqffhbi8x813s5b/Untitled-4_56797495-9cc7-41dd-81af-7a4f7b4b19a2.webp?t=2-91d4d02e446e84fe942313433391994a883201d0-1787346256-1",
    ],
    links: [
      { label: "Achat en ligne", href: "https://rosabella.ma/" },
    ],
  },
  {
    slug: "sogno",
    name: "SOGNO",
    tagId: "nhFpeKaQz0I",
    level: "N1",
    category: "Alimentation",
    description:
      "Tiramisu et café, au premier étage.",
    gallery: [
      "https://cdn-2.matterport.com/attachments/ec5sy0kinc0nhf66kk0bbt9pa/Sogno_logo.jpeg?t=2-6d41309326e7e782d92fc4ff9aa4fb226bad7809-1787346430-1",
      "https://cdn-2.matterport.com/attachments/23m5cqshnwzm4s9sp2r6m07wc/Sogno_menu.jpeg?t=2-f090a5f802b2ba62ea55d046b3c25989a8aecb6b-1787346430-1",
      "https://cdn-2.matterport.com/attachments/4ukrmhyhq6gaqa483ssf724gd/Sogno_World_Cup_26.jpeg?t=2-2a0434cde437a3450ea70becb3787aaefa6c8777-1787346430-1",
      "https://cdn-2.matterport.com/attachments/k8a7i02q9p33hnmwhxqypnhna/Sogno4.jpeg?t=2-a44f6c9acd959fab50a798ee8c2c171f90d66e50-1787346430-1",
      "https://cdn-2.matterport.com/attachments/ix9di36kh991y80g3hf4zzdib/Sogno5.jpeg?t=2-eeb3e05ed98f4f3b2c12e575dabb9e879cf79bb6-1787346430-1",
      "https://cdn-2.matterport.com/attachments/y59kxzdacpkwqkt4ks7y3frdc/Sogno2.jpeg?t=2-f14655adb0483b29e9e398a8477ee55eaca6b2d8-1787346430-1",
      "https://cdn-2.matterport.com/attachments/faktdnxmhffk1793xsff3dtwd/Sogno1.jpeg?t=2-dc936c526a444972ace971797a74193eb56dacf8-1787346430-1",
      "https://cdn-2.matterport.com/attachments/kx9gp2bug5de670tx0997cs3a/Sogno3.jpeg?t=2-300a38e74eeb218d1989bde0f0696ddcf2af70c9-1787346430-1",
    ],
    links: [
      { label: "Instagram", href: "https://www.instagram.com/sogno.ma/?hl=fr" },
    ],
  },
  {
    slug: "springfield",
    name: "SPRINGFIELD",
    tagId: "NEmmykNk4YN",
    level: "N0",
    category: "Mode",
    description:
      "Prêt-à-porter espagnol, distribué au Maroc par Vogue Retail Shop.",
    gallery: [
      "https://cdn-2.matterport.com/attachments/494dazamu2ure0sx8259ahz0a/images__7_.jpeg?t=2-3bee0e5e28ec2694df9fec812e60548d5687a017-1787346256-1",
      "https://cdn-2.matterport.com/attachments/0khim18edfeyc6memg2n7n5ed/P_795360950FM.jpg?t=2-3ed1f9bec020739a33d4f89a432ed4ec95a696bc-1787346256-1",
      "https://cdn-2.matterport.com/attachments/dyu1rd4g5s55ta8xfhg3ar9cc/P_099338801TM.jpg?t=2-bb50b8d98988a72f67f2ac3be249f64e88772e74-1787346256-1",
      "https://cdn-2.matterport.com/attachments/ru9qskauwn5phqm8zb4mytdha/P_841329026TM.jpg?t=2-4860cc5eebee3d7657db86f715eb71b6b1edd979-1787346256-1",
      "https://cdn-2.matterport.com/attachments/6k3iudciqcby80ymchqt5rp2d/P_054301851FM.jpg?t=2-d8c9d506da3e9b85f33f8a71998eaef5d282ed46-1787346256-1",
      "https://cdn-2.matterport.com/attachments/68rqzpm3kihdbtbpdazc6f5xd/P_795361037FM.jpg?t=2-e7cf3670094ca686d9a1ae15f650fb69e9472431-1787346256-1",
      "https://cdn-2.matterport.com/attachments/tdgscw3hssxy30xu55k5qwdtc/P_155372611FM.jpg?t=2-4262a0d30988d7dc0cf049457b10d77783ae4300-1787346256-1",
    ],
    links: [
      { label: "Achat en ligne", href: "https://www.vogueretailshop.ma/categorie-produit/springfield/" },
    ],
  },
  {
    slug: "summer-market",
    name: "SUMMER MARKET",
    tagId: "UpxuHOamuPk",
    level: "N1",
    category: "Événement",
    description:
      "Animation saisonnière du premier étage. Sa fiche renvoie au rez-de-chaussée.",
    gallery: [
      // aucune photo sur ce pin
    ],
    links: [
      { label: "SUMMER MARKET", href: "https://my.matterport.com/show/?m=iGiPWMPBMdw" },
    ],
  },
  {
    slug: "womensecret",
    name: "WOMEN'SECRET",
    tagId: "jNng1q2TeSK",
    level: "N0",
    category: "Lingerie",
    description:
      "Lingerie et vêtements de nuit, distribués au Maroc par Vogue Retail Shop.",
    gallery: [
      "https://cdn-2.matterport.com/attachments/6wsbatbsr8d0m8i90xgcki3mc/logo_womensecret.png?t=2-8930fa9bced68633d5dd4c51b268eeaa0cca16da-1787346256-1",
      "https://cdn-2.matterport.com/attachments/fg9f3ayf7ufhwruawtuud9x4d/P_492368123TM.jpg?t=2-23db1805c069b245830a88734a73860731583531-1787346256-1",
      "https://cdn-2.matterport.com/attachments/zadsq17f10mgntzgh678np7rb/P_552333496TM.jpg?t=2-bf359a7724d69cc2fd650f2e39ae78206b55c79f-1787346256-1",
      "https://cdn-2.matterport.com/attachments/h73tiimhntikzeweggwwibk2c/P_444362209FM.jpg?t=2-cf04c2ce3997c4988bfd35f9552f5c73c5fa33f7-1787346256-1",
      "https://cdn-2.matterport.com/attachments/hqs41d84wzm6x23y1dkpd3cra/P_492367201D1.jpg?t=2-949ef1ead1b167bef7940ccb1d1e884daee348e2-1787346256-1",
    ],
    links: [
      { label: "Achat en ligne", href: "https://www.vogueretailshop.ma/categorie-produit/women-secret/" },
    ],
  },
];
