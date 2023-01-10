import type { SocialObjects } from "./types";

export const SITE = {
  website: "https:/petermwangi.me/",
  author: "Peter Mwangi",
  desc: "Peter Mwangi's personal blog: Musings of a software engineer.",
  title: "Peter Mwangi's personal blog: Musings of a software engineer.",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,
  postPerPage: 3,
};

export const SOCIALS: SocialObjects = [
  {
    name: "Github",
    href: "https://github.com/engpetermwangi",
    linkTitle: ` ${SITE.title} on Github`,
    active: true,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/peter-mwangi-59932bb9/",
    linkTitle: `${SITE.title} on LinkedIn`,
    active: true,
  },
  {
    name: "Mail",
    href: "mailto:pmwangi155@gmail.com",
    linkTitle: `Send an email to ${SITE.title}`,
    active: true,
  },
  {
    name: "Twitter",
    href: "https://twitter.com/engpetermwangi",
    linkTitle: `${SITE.title} on Twitter`,
    active: true,
  },
  {
    name: "WhatsApp",
    href: "https://wa.me/+254717091262",
    linkTitle: `${SITE.title} on WhatsApp`,
    active: true,
  },
];
