"use client";

import { useMemo, useState, useEffect } from "react";
import {
  CalendarDays,
  ChevronRight,
  Heart,
  ImagePlus,
  LockKeyhole,
  MessageCircle,
  Music2,
  Plus,
  Search,
  Sparkles,
  X,
} from "lucide-react";

import { uploadImage } from "@/lib/uploadImage";

type Photo = {
  url: string;
  caption: string;
  file?: File;
};

type Person = {
  id?: number;
  name: string;
  handle: string;
  bio: string;
  color: string;
  avatar: string;
  tags: string[];
  dob: string;
  gender: string;
  favourite: string;
  hobbies: string;
  about: string;
  spotify?: string;
  specialMemory?: string;
  photos?: Photo[];
};

type Entry = {
  id: number;
  name: string;
  relationship: string;
  rating: number;
  date: string;
  since: string;
  bestFriend?: boolean;
  avatar: string;
  message: string;
  memory: string;
  song: string;
  dedication?: string;
  photos?: Photo[];
};

const tabs = ["About Me", "Friends", "Memories", "Messages"];

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8080/api";
  
export default function Page() {
  const [people, setPeople] = useState<Person[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selected, setSelected] = useState<Person | null>(null);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("About Me");

  const [modal, setModal] = useState<
    "none" | "create" | "editSlam" | "friend" | "editFriend"
  >("none");

  const [editing, setEditing] = useState<Entry | null>(null);
  const [secret, setSecret] = useState(false);

  const [notice, setNotice] = useState<{
    message: string;
    tone: "success" | "error";
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const notify = (
    message: string,
    tone: "success" | "error" = "success",
  ) => {
    setNotice({ message, tone });

    window.setTimeout(
      () => setNotice(null),
      tone === "error" ? 4000 : 2500,
    );
  };

  // =========================
  // FETCH SLAMBOOKS
  // =========================

  const fetchSlamBooks = async (selectId?: number) => {
    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/slam`);

      if (!res.ok) {
        throw new Error("Failed to fetch SlamBooks from backend");
      }

      const data = await res.json();

      const mapped: Person[] = data.map((item: any) => ({
        id: item.id,
        name: item.fullName,

        handle: item.nickname
          ? item.nickname.startsWith("@")
            ? item.nickname
            : `@${item.nickname}`
          : `@${item.fullName
              .toLowerCase()
              .replace(/\s+/g, "")}`,

        bio: item.aboutMe || "",

        color: "bg-[#ffd9c7]",

        avatar: item.profilePhotoUrl || "",

        tags: item.hobbies
          ? item.hobbies
              .split(",")
              .map((t: string) => t.trim())
              .filter(Boolean)
          : [],

        dob: item.dateOfBirth || "",
        gender: item.gender || "",
        favourite: item.favoriteColor || "",
        hobbies: item.hobbies || "",
        about: item.aboutMe || "",
        spotify: item.songUrl || "",
        specialMemory: item.memoryText || "",

        photos: [],
      }));

      setPeople(mapped);

      if (mapped.length > 0) {
        if (selectId) {
          const found = mapped.find((p) => p.id === selectId);
          setSelected(found || mapped[0]);
        } else {
          setSelected(mapped[0]);
        }
      } else {
        setSelected(null);
      }
    } catch (err: any) {
      console.error(err);

      notify(
        "Could not load SlamBooks. Check if Spring Boot backend is running on 8080.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FETCH FRIENDS
  // =========================

  const fetchFriends = async (slamId: number) => {
    try {
      const res = await fetch(`${API_BASE}/slam/${slamId}/friends`);

      if (!res.ok) {
        throw new Error("Failed to fetch friends");
      }

      const data = await res.json();

      const mapped: Entry[] = data.map((item: any) => ({
        id: item.id,
        name: item.friendName,
        relationship: item.relationship,
        rating: item.friendshipRating || 0,

        date: "recently",

        since: item.friendshipStartDate
          ? item.friendshipStartDate.split("-")[0]
          : "forever",

        bestFriend: item.isBestFriend,

        avatar: item.profilePhotoUrl || "",

        message: item.message || "",
        memory: item.memory || "",

        song: item.songName || item.songUrl || "No anthem added",

        dedication: item.songDedication || "",

        photos:
          item.memoryPhotos && item.memoryPhotos.length > 0
            ? item.memoryPhotos.map((p: any) => ({
                url: p.url,
                caption: p.caption || "",
              }))
            : item.memoryPhotoUrl
              ? [
                  {
                    url: item.memoryPhotoUrl,
                    caption: "Memory",
                  },
                ]
              : [],
      }));

      setEntries(mapped);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSlamBooks();
  }, []);

  useEffect(() => {
    if (selected?.id) {
      fetchFriends(selected.id);
    } else {
      setEntries([]);
    }
  }, [selected]);

  const filtered = useMemo(
    () =>
      people.filter((p) =>
        `${p.name} ${p.handle} ${p.tags.join(" ")}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [people, query],
  );

  // =========================
  // FRIEND MODAL
  // =========================

  const openFriend = (entry?: Entry) => {
    setEditing(entry ?? null);
    setModal(entry ? "editFriend" : "friend");
  };

  // =========================
  // DELETE FRIEND
  // =========================

  const removeEntry = async (id: number) => {
    if (
      window.confirm(
        "Delete this friend entry? This cannot be undone.",
      )
    ) {
      try {
        const res = await fetch(`${API_BASE}/friends/${id}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          throw new Error("Failed to delete friend");
        }

        notify("Entry deleted from the book.");

        if (selected?.id) {
          fetchFriends(selected.id);
        }
      } catch (err: any) {
        console.error(err);
        notify("Error deleting friend entry.", "error");
      }
    }
  };

  // =========================
  // DELETE SLAMBOOK
  // =========================

  const removeSlamBook = async () => {
    if (!selected?.id || deleting) return;

    if (
      window.confirm(
        "Delete your SlamBook? This cannot be undone.",
      )
    ) {
      try {
        setDeleting(true);

        const res = await fetch(`${API_BASE}/slam/${selected.id}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || "Failed to delete SlamBook");
        }

        const deletedId = selected.id;

        const remaining = people.filter(
          (person) => person.id !== deletedId,
        );

        setPeople(remaining);
        setEntries([]);
        setSelected(remaining[0] || null);

        notify("SlamBook deleted successfully.");
      } catch (err: any) {
        console.error(err);

        notify(
          err.message || "Error deleting SlamBook.",
          "error",
        );
      } finally {
        setDeleting(false);
      }
    }
  };

  // =========================
  // CREATE / UPDATE SLAMBOOK
  // =========================

  const handleSaveSlamBook = async (
    personData: any,
    action: "create" | "edit",
  ) => {
    let parsedDob: string | null = null;

    if (personData.dob) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(personData.dob)) {
        parsedDob = personData.dob;
      } else {
        const parts = personData.dob.split(/[-/.\s]+/);

        if (parts.length === 3) {
          if (parts[2].length === 4) {
            parsedDob = `${parts[2]}-${parts[1].padStart(
              2,
              "0",
            )}-${parts[0].padStart(2, "0")}`;
          } else if (parts[0].length === 4) {
            parsedDob = `${parts[0]}-${parts[1].padStart(
              2,
              "0",
            )}-${parts[2].padStart(2, "0")}`;
          }
        }
      }
    }

    const payload = {
      fullName: personData.name,
      nickname: personData.handle,
      profilePhotoUrl: personData.profilePhotoUrl || "",
      dateOfBirth: parsedDob,
      gender: personData.gender || "",
      favoriteColor: personData.favourite || "",
      hobbies: personData.hobbies || "",
      aboutMe: personData.about || "",
      songUrl: personData.spotify || "",
      memoryText: personData.specialMemory || "",

      memoryPhotoUrl: "",
      memoryPhotos: [],
    };

    let url = `${API_BASE}/slam`;
    let method = "POST";

    if (action === "edit" && selected?.id) {
      url = `${API_BASE}/slam/${selected.id}`;
      method = "PUT";
    }

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || "Failed to save SlamBook");
    }

    const saved = await res.json();

    setModal("none");

    notify(
      action === "edit"
        ? "Your SlamBook was updated."
        : "Your SlamBook is ready to share.",
    );

    await fetchSlamBooks(saved.id);
  };

  // =========================
  // CREATE / UPDATE FRIEND
  // =========================

  const handleSaveFriend = async (entryData: any) => {
    if (!selected?.id) return;

    let parsedSince: string | null = null;

    if (entryData.since) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(entryData.since)) {
        parsedSince = entryData.since;
      } else if (/^\d{4}$/.test(entryData.since)) {
        parsedSince = `${entryData.since}-01-01`;
      } else {
        const parts = entryData.since.split(/[-/.\s]+/);

        if (
          parts.length === 3 &&
          parts[2].length === 4
        ) {
          parsedSince = `${parts[2]}-${parts[1].padStart(
            2,
            "0",
          )}-${parts[0].padStart(2, "0")}`;
        }
      }
    }

    if (!parsedSince) {
      parsedSince = new Date()
        .toISOString()
        .split("T")[0];
    }

    const payload = {
      friendName: entryData.name,
      relationship: entryData.relationship,
      friendshipRating: entryData.rating,
      isBestFriend: entryData.bestFriend,
      friendshipStartDate: parsedSince,
      message: entryData.message,
      songName: entryData.song || "No Anthem",
      songArtist: "Various",
      songUrl: entryData.song || "",
      songDedication: entryData.dedication || "",

      memoryPhotoUrl:
        entryData.photos?.[0]?.url || "",

      profilePhotoUrl:
        entryData.profilePhotoUrl || "",

      memory: entryData.memory,

      memoryPhotos: (entryData.photos || []).map(
        (p: {
          url: string;
          caption: string;
        }) => ({
          url: p.url,
          caption: p.caption,
        }),
      ),
    };

    let url = `${API_BASE}/slam/${selected.id}/friends`;
    let method = "POST";

    if (editing?.id) {
      url = `${API_BASE}/friends/${editing.id}`;
      method = "PUT";
    }

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(
        errText || "Failed to save friend entry",
      );
    }

    setModal("none");

    notify(
      editing
        ? "Your entry was updated."
        : "It's in the book.",
    );

    await fetchFriends(selected.id);
  };

  return (
    <main
      id="top"
      className="min-h-screen overflow-hidden bg-background text-foreground"
    >
      {/* NAVBAR */}

      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:px-8">
        <a
          href="#top"
          className="flex items-center gap-2 font-bold tracking-tight"
        >
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles size={17} />
          </span>

          <span className="text-lg">
            slambook<span className="text-primary">.</span>
          </span>
        </a>

        <div className="hidden gap-8 text-sm font-medium text-muted-foreground md:flex">
          <a href="#discover" className="text-foreground">
            Discover
          </a>

          <a href="#book">My book</a>

          <a href="#how">How it works</a>
        </div>

        <button
          onClick={() => setModal("create")}
          className="rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20"
        >
          Create my SlamBook
        </button>
      </nav>

      {/* HERO */}

      <section className="relative mx-auto max-w-6xl px-5 pb-16 pt-12 md:px-8 md:pb-24 md:pt-20">
        <div className="pointer-events-none absolute -left-20 top-0 size-72 rounded-full bg-accent/60 blur-3xl" />

        <div className="pointer-events-none absolute right-0 top-20 size-64 rounded-full bg-secondary/70 blur-3xl" />

        <div className="relative grid items-center gap-12 lg:grid-cols-[1fr_.9fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs font-bold uppercase tracking-[.16em] text-primary shadow-sm">
              <span className="size-1.5 rounded-full bg-primary" />
              a little corner for big feelings
            </div>

            <h1 className="max-w-xl text-balance text-5xl font-bold leading-[1.02] tracking-[-.06em] md:text-7xl">
              Your friendships,
              <br />
              <span className="bg-gradient-to-r from-primary via-fuchsia-500 to-accent bg-clip-text text-transparent">
                but make it
                <br />
                a keepsake.
              </span>
            </h1>

            <p className="mt-6 max-w-md text-pretty text-base leading-7 text-muted-foreground md:text-lg">
              A digital SlamBook for the people, inside
              jokes, songs and memories you never want to
              lose.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() =>
                  document
                    .getElementById("discover")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    })
                }
                className="flex items-center gap-2 rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground shadow-xl shadow-primary/20"
              >
                Find a friend
                <ChevronRight size={17} />
              </button>

              <button
                onClick={() => setModal("create")}
                className="rounded-full border border-border bg-card px-5 py-3 font-semibold"
              >
                Start your page
              </button>
            </div>
          </div>

          <div className="relative mx-auto h-[330px] w-full max-w-[460px]">
            {[0, 1, 2].map((index) => {
              const person = people[index];

              if (!person) return null;

              const positions = [
                "absolute right-2 top-0 w-56 rotate-[6deg]",
                "absolute left-4 top-12 w-56 rotate-[-7deg]",
                "absolute bottom-0 left-24 w-56 rotate-[-3deg]",
              ];

              return (
                <div
                  key={person.id || index}
                  className={`${positions[index]} rounded-[2rem] border border-border bg-card p-5 shadow-2xl shadow-primary/15`}
                >
                  {person.avatar ? (
                    <img
                      src={person.avatar}
                      alt={person.name}
                      className="mx-auto size-20 rounded-2xl object-cover"
                    />
                  ) : (
                    <span className="mx-auto grid size-20 place-items-center rounded-2xl bg-muted text-2xl font-bold text-muted-foreground">
                      {person.name.charAt(0)}
                    </span>
                  )}

                  <p className="mt-3 text-center font-bold">
                    {person.name}
                  </p>

                  <p className="mt-1 text-center text-xs text-primary">
                    a living keepsake
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* DISCOVER */}

      <section
        id="discover"
        className="border-y border-border bg-card/50 px-5 py-16 md:px-8 md:py-24"
      >
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[.18em] text-primary">
                the discovery room
              </p>

              <h2 className="text-3xl font-bold tracking-[-.04em] md:text-5xl">
                Whose book are you filling?
              </h2>

              <p className="mt-3 text-muted-foreground">
                Find your people and leave them something
                they&apos;ll keep.
              </p>
            </div>

            <div className="flex w-full items-center gap-2 rounded-2xl border border-border bg-background px-4 py-3 md:max-w-xs">
              <Search
                size={18}
                className="text-muted-foreground"
              />

              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name or vibe"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {loading ? (
            <div className="mt-10 text-center font-semibold text-muted-foreground">
              Loading SlamBooks...
            </div>
          ) : filtered.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-border bg-background p-8 text-center">
              <p className="font-semibold">
                No SlamBooks found.
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Try another name or create a SlamBook.
              </p>
            </div>
          ) : (
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {filtered.map((person) => (
                <button
                  key={person.id || person.handle}
                  onClick={() => {
                    setSelected(person);
                    setTab("About Me");

                    document
                      .getElementById("book")
                      ?.scrollIntoView({
                        behavior: "smooth",
                      });
                  }}
                  className={`group relative overflow-hidden rounded-[2rem] border bg-background p-5 text-left transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
                    selected?.id === person.id
                      ? "border-primary shadow-lg shadow-primary/10"
                      : "border-border"
                  }`}
                >
                  <div
                    className={`absolute inset-x-0 top-0 h-28 opacity-80 ${person.color}`}
                  />

                  <div className="relative flex items-start justify-between">
                    {person.avatar ? (
                      <img
                        src={person.avatar}
                        alt={`${person.name} avatar`}
                        className="size-20 rounded-2xl border-4 border-background object-cover shadow-lg"
                      />
                    ) : (
                      <span className="grid size-20 place-items-center rounded-2xl border-4 border-background bg-muted text-xl font-bold text-muted-foreground shadow-lg">
                        {person.name.charAt(0)}
                      </span>
                    )}

                    <span className="rounded-full bg-card/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur">
                      {selected?.id === person.id
                        ? "viewing"
                        : "open book"}{" "}
                      <ChevronRight
                        className="inline"
                        size={12}
                      />
                    </span>
                  </div>

                  <div className="relative mt-5">
                    <h3 className="text-xl font-bold">
                      {person.name}
                    </h3>

                    <p className="text-sm text-primary">
                      {person.handle}
                    </p>

                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {person.bio}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {person.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* BOOK */}

      {selected && (
        <section
          id="book"
          className="mx-auto max-w-6xl scroll-mt-6 px-5 py-16 md:px-8 md:py-24"
        >
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="flex items-center gap-4">
              {selected.avatar ? (
                <img
                  src={selected.avatar}
                  alt={`${selected.name} avatar`}
                  className="size-20 rounded-[1.5rem] object-cover shadow-lg"
                />
              ) : (
                <span className="grid size-20 place-items-center rounded-[1.5rem] bg-muted text-xl font-bold text-muted-foreground shadow-lg">
                  {selected.name.charAt(0)}
                </span>
              )}

              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span className="rounded-full bg-accent px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                    SlamBook
                  </span>

                  <span className="text-xs text-muted-foreground">
                    a living keepsake
                  </span>
                </div>

                <h2 className="text-3xl font-bold tracking-[-.04em]">
                  {selected.name}&apos;s book
                </h2>

                <p className="text-sm text-muted-foreground">
                  A collection of good things, by good
                  people.
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setModal("editSlam")}
                className="rounded-full border border-border bg-card px-4 py-3 text-sm font-semibold"
              >
                Edit my book
              </button>

              <button
                onClick={() => openFriend()}
                className="flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground"
              >
                <Plus size={18} />
                Add to their book
              </button>
            </div>
          </div>

          <div className="mt-10 flex gap-1 overflow-x-auto border-b border-border">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition ${
                  tab === t
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="mt-10">
            {tab === "About Me" && (
              <About
                selected={selected}
                secret={secret}
                onSecret={() => setSecret(!secret)}
                onDelete={removeSlamBook}
              />
            )}

            {tab === "Friends" && (
              <Friends
                entries={entries}
                onAdd={() => openFriend()}
                onEdit={openFriend}
                onDelete={removeEntry}
              />
            )}

            {tab === "Memories" && (
              <Memories entries={entries} />
            )}

            {tab === "Messages" && (
              <Messages entries={entries} />
            )}
          </div>
        </section>
      )}

      {/* HOW */}

      <section
        id="how"
        className="bg-primary px-5 py-16 text-primary-foreground md:px-8 md:py-20"
      >
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest opacity-70">
              01 / discover
            </p>

            <h3 className="mt-3 text-2xl font-bold">
              Find your person
            </h3>

            <p className="mt-2 text-sm leading-6 opacity-75">
              Search the room, find their unique vibe,
              and open their SlamBook.
            </p>
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-widest opacity-70">
              02 / fill in
            </p>

            <h3 className="mt-3 text-2xl font-bold">
              Make it personal
            </h3>

            <p className="mt-2 text-sm leading-6 opacity-75">
              Upload a memory and say the thing you
              never text.
            </p>
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-widest opacity-70">
              03 / keep close
            </p>

            <h3 className="mt-3 text-2xl font-bold">
              Come back to it
            </h3>

            <p className="mt-2 text-sm leading-6 opacity-75">
              Their book grows into a living time capsule
              of your favourite people.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}

      <footer className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-8">
        <span className="font-bold text-foreground">
          slambook<span className="text-primary">.</span>
        </span>

        <span>
          Made for the people who make life memorable.
        </span>

        <span>© 2026 SlamBook</span>
      </footer>

      {/* NOTIFICATION */}

      {notice && (
        <div
          role={notice.tone === "error" ? "alert" : "status"}
          className={`fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 rounded-full px-5 py-3 text-sm font-semibold shadow-2xl ${
            notice.tone === "error"
              ? "bg-destructive text-destructive-foreground"
              : "bg-foreground text-background"
          }`}
        >
          {notice.message}
        </div>
      )}

      {/* MODAL */}

      {modal !== "none" && (
        <Modal
          mode={modal}
          editing={editing}
          editingSlam={selected}
          onClose={() => {
            if (!modal.includes("editFriend")) {
              setEditing(null);
            }

            setModal("none");
          }}
          onSaveSlam={handleSaveSlamBook}
          onSaveEntry={handleSaveFriend}
          onNotify={notify}
        />
      )}
    </main>
  );
}

// =========================
// ABOUT
// =========================

function About({
  selected,
  secret,
  onSecret,
  onDelete,
}: {
  selected: Person;
  secret: boolean;
  onSecret: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="grid gap-5 md:grid-cols-[1.15fr_.85fr]">
      <div className="rounded-[2rem] bg-accent p-7 md:p-9">
        <span className="text-xs font-bold uppercase tracking-widest text-primary">
          a few words from me
        </span>

        <h3 className="mt-5 max-w-lg text-3xl font-bold leading-tight tracking-[-.04em]">
          “{selected.about || "A little about me..."}”
        </h3>

        <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
          <Info
            label="Born on"
            value={selected.dob || "Not added yet"}
          />

          <Info
            label="Favourite colour"
            value={selected.favourite || "Not added yet"}
          />

          <Info
            label="Hobbies"
            value={selected.hobbies || "Not added yet"}
          />

          <Info
            label="Pronouns"
            value={selected.gender || "Not added yet"}
          />
        </div>

        {selected.specialMemory && (
          <div className="mt-7 rounded-2xl bg-background/40 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              special memory
            </p>

            <p className="mt-2 text-sm leading-6">
              {selected.specialMemory}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col justify-between rounded-[2rem] border border-border bg-card p-7">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              secret corner
            </span>

            <LockKeyhole size={17} className="text-primary" />
          </div>

          <p className="mt-7 text-lg font-semibold">
            There&apos;s something I want you to know...
          </p>

          <p
            className={`mt-3 text-sm leading-6 ${
              secret
                ? "text-foreground"
                : "select-none text-muted-foreground blur-sm"
            }`}
          >
            {secret
              ? "You are one of the safest places in my life. Thank you for always showing up as yourself."
              : "This stays locked until you tap the button."}
          </p>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={onSecret}
            className="flex items-center gap-2 text-sm font-bold text-primary"
          >
            {secret ? "Hide secret" : "Unlock secret"}
            <ChevronRight size={16} />
          </button>

          <div className="flex gap-2">
            <button
              onClick={() =>
                document
                  .getElementById("book")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
              className="rounded-full border border-border px-3 py-2 text-xs font-semibold"
            >
              Edit details
            </button>

            <button
              onClick={onDelete}
              className="rounded-full border border-destructive/30 px-3 py-2 text-xs font-semibold text-destructive"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================
// INFO
// =========================

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className="mt-1 font-bold">{value}</p>
    </div>
  );
}

// =========================
// FRIENDS
// =========================

function Friends({
  entries,
  onAdd,
  onEdit,
  onDelete,
}: {
  entries: Entry[];
  onAdd: () => void;
  onEdit: (entry: Entry) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">
            Friends wall
          </h3>

          <p className="text-sm text-muted-foreground">
            The people leaving a little love behind.
          </p>
        </div>

        <button
          onClick={onAdd}
          className="rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-primary"
        >
          + leave a note
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <p className="font-semibold">
            No friends have filled this SlamBook yet.
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Share your SlamBook and let your friends add
            their memories.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {entries.map((f) => (
            <div
              key={f.id}
              className="rounded-[1.5rem] border border-border bg-card p-5"
            >
              <div className="flex items-center gap-3">
                {f.avatar ? (
                  <img
                    src={f.avatar}
                    alt={`${f.name} avatar`}
                    className="size-11 rounded-xl object-cover"
                  />
                ) : (
                  <span className="grid size-11 place-items-center rounded-xl bg-muted text-sm font-bold text-muted-foreground">
                    {f.name.charAt(0)}
                  </span>
                )}

                <div>
                  <p className="font-bold">{f.name}</p>

                  <p className="text-xs text-muted-foreground">
                    {f.relationship} · {f.date}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex gap-1 text-primary">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Heart
                    key={i}
                    size={13}
                    className={
                      i < Math.round(f.rating / 2)
                        ? "fill-primary"
                        : ""
                    }
                  />
                ))}
              </div>

              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                {f.message}
              </p>

              <p className="mt-4 text-xs font-semibold text-primary">
                friends since {f.since}
              </p>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => onEdit(f)}
                  className="rounded-full bg-muted px-3 py-1.5 text-xs font-semibold"
                >
                  Edit
                </button>

                <button
                  onClick={() => onDelete(f.id)}
                  className="rounded-full bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =========================
// MEMORIES
// =========================

function Memories({
  entries,
}: {
  entries: Entry[];
}) {
  return (
    <div>
      <div className="mb-8">
        <h3 className="text-2xl font-bold">
          Memory timeline
        </h3>

        <p className="mt-1 text-sm text-muted-foreground">
          The moments that made the friendship.
        </p>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-6 text-center">
          <p className="font-semibold">
            No memories yet.
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Be the first person to add a special memory.
          </p>
        </div>
      ) : (
        /*
         * IMPORTANT:
         * One friend entry = one card.
         * Every photo inside that entry is displayed
         * vertically, one below another.
         */
        <div className="mx-auto max-w-3xl space-y-6">
          {entries.map((m, i) => (
            <div
              key={m.id}
              className="overflow-hidden rounded-[2rem] border border-border bg-card p-5 shadow-sm transition hover:shadow-md md:p-6"
            >
              {/* HEADER */}

              <div className="flex items-center gap-3">
                {m.avatar ? (
                  <img
                    src={m.avatar}
                    alt={m.name}
                    className="h-11 w-11 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-muted text-sm font-bold">
                    {m.name.charAt(0)}
                  </div>
                )}

                <div>
                  <p className="text-sm font-bold">
                    {m.name}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {m.relationship}
                  </p>
                </div>

                <span className="ml-auto rounded-full bg-muted px-3 py-1 text-[10px] font-bold">
                  #{i + 1}
                </span>
              </div>

              {/* DATE */}

              <div className="mt-5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                <CalendarDays size={12} />
                {m.since}
              </div>

              {/* MEMORY */}

              {m.memory && (
                <h4 className="mt-2 text-lg font-bold">
                  {m.memory}
                </h4>
              )}

              {/* MESSAGE */}

              {m.message && (
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {m.message}
                </p>
              )}

              {/* ==================================
                  PHOTOS
                  ONE BELOW ANOTHER
                  BIG PHOTO LEFT
                  CAPTION RIGHT
                  ================================== */}

              {m.photos && m.photos.length > 0 && (
                <div className="mt-6 flex flex-col gap-4">
                  {m.photos.map((photo, photoIndex) => (
                    <div
                      key={`${photo.url}-${photoIndex}`}
                      className="w-full rounded-2xl border border-primary/20 bg-background p-3"
                    >
                      <div className="flex items-center gap-4">
                        {/* BIG PHOTO */}

                        <div className="h-[150px] w-[200px] shrink-0 overflow-hidden rounded-2xl border border-primary/20 bg-muted">
                          <img
                            src={photo.url}
                            alt={
                              photo.caption ||
                              `${m.memory || "Memory"} photo ${
                                photoIndex + 1
                              }`
                            }
                            className="h-full w-full object-cover"
                          />
                        </div>

                        {/* CAPTION */}

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold leading-6 text-foreground">
                            {photo.caption ||
                              "A special moment ❤️"}
                          </p>

                          <p className="mt-2 text-xs text-muted-foreground">
                            Photo {photoIndex + 1}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* SONG */}

              {m.song &&
                m.song !== "No anthem added" && (
                  <div className="mt-5 flex items-center gap-2 rounded-xl bg-accent/40 px-3 py-2">
                    <Music2
                      size={13}
                      className="shrink-0 text-primary"
                    />

                    <div className="min-w-0">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-primary">
                        Our anthem
                      </p>

                      <p className="truncate text-xs text-muted-foreground">
                        {m.song}
                      </p>
                    </div>
                  </div>
                )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =========================
// MESSAGES
// =========================

function Messages({
  entries,
}: {
  entries: Entry[];
}) {
  return (
    <div className="mx-auto max-w-2xl rounded-[2rem] bg-primary p-8 text-primary-foreground">
      <MessageCircle size={24} />

      <p className="mt-8 text-3xl font-bold tracking-[-.04em]">
        “
        {entries[0]?.message ||
          "Leave the first little note."}
        ”
      </p>

      <div className="mt-8 flex items-center gap-3">
        {entries[0]?.avatar ? (
          <img
            src={entries[0].avatar}
            alt={entries[0].name}
            className="size-10 rounded-xl object-cover"
          />
        ) : (
          <span className="grid size-10 place-items-center rounded-xl bg-primary-foreground/20 text-sm font-bold">
            {entries[0]?.name?.charAt(0) || "?"}
          </span>
        )}

        <div>
          <p className="font-bold">
            {entries[0]?.name || "Your friend"}
          </p>

          <p className="text-xs opacity-70">
            left this for you ·{" "}
            {entries[0]?.date || "soon"}
          </p>
        </div>
      </div>
    </div>
  );
}

// =========================
// MODAL
// =========================

function Modal({
  mode,
  editing,
  editingSlam,
  onClose,
  onSaveSlam,
  onSaveEntry,
  onNotify,
}: {
  mode:
    | "create"
    | "editSlam"
    | "friend"
    | "editFriend";

  editing: Entry | null;
  editingSlam: Person | null;
  onClose: () => void;

  onSaveSlam: (
    person: any,
    action: "create" | "edit",
  ) => Promise<void>;

  onSaveEntry: (
    entry: any,
  ) => Promise<void>;

  onNotify: (
    message: string,
    tone?: "success" | "error",
  ) => void;
}) {
  const isSlam =
    mode === "create" ||
    mode === "editSlam";

  const isCreate = mode === "create";

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [files, setFiles] = useState<Photo[]>(
    isSlam ? [] : editing?.photos || [],
  );

  const [spotify, setSpotify] = useState(
    isSlam
      ? mode === "editSlam"
        ? editingSlam?.spotify || ""
        : ""
      : editing?.song?.startsWith("http")
        ? editing.song
        : "",
  );

  const [slamProfilePhotoUrl, setSlamProfilePhotoUrl] =
    useState(
      isSlam && mode === "editSlam"
        ? editingSlam?.avatar || ""
        : "",
    );

  const [
    friendProfilePhotoUrl,
    setFriendProfilePhotoUrl,
  ] = useState(
    !isSlam
      ? editing?.avatar || ""
      : "",
  );

  const uploadProfilePhoto = async (
    file: File,
  ) => {
    return await uploadImage(
      file,
      "profiles",
    );
  };

  const addPhotos = (
    list: FileList | null,
  ) => {
    if (!list) return;

    const selectedFiles = Array.from(list);

    setFiles((current) => [
      ...current,

      ...selectedFiles.map((file) => ({
        url: URL.createObjectURL(file),
        caption: file.name.replace(
          /\.[^/.]+$/,
          "",
        ),
        file,
      })),
    ]);
  };

  const changeCaption = (
    index: number,
    caption: string,
  ) => {
    setFiles((current) =>
      current.map((p, i) =>
        i === index
          ? { ...p, caption }
          : p,
      ),
    );
  };

  const removePhoto = (
    index: number,
  ) => {
    setFiles((current) =>
      current.filter(
        (_, i) => i !== index,
      ),
    );
  };

  const submit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    const data = new FormData(
      e.currentTarget,
    );

    const required = isSlam
      ? ["fullName", "about"]
      : [
          "yourName",
          "relationship",
          "since",
          "rating",
          "memory",
          "message",
        ];

    const missing = required.find(
      (key) =>
        !String(
          data.get(key) || "",
        ).trim(),
    );

    if (missing) {
      const message =
        "Please fill every field marked with * before saving.";

      setError(message);
      onNotify(message, "error");
      return;
    }

    if (
      !isSlam &&
      spotify.trim() &&
      !/^https?:\/\/(open\.)?spotify\.com\//.test(
        spotify.trim(),
      )
    ) {
      const message =
        "Please use a valid Spotify track link.";

      setError(message);
      onNotify(message, "error");
      return;
    }

    setError("");
    setSaving(true);

    try {
      if (isSlam) {
        const person = {
          name: String(
            data.get("fullName") || "",
          ),

          handle:
            String(
              data.get("nickname") || "",
            ).trim()
              ? `@${String(
                  data.get("nickname"),
                ).replace(/^@/, "")}`
              : `@${String(
                  data.get("fullName"),
                )
                  .toLowerCase()
                  .replace(/\s+/g, "")}`,

          dob: String(
            data.get("dob") || "",
          ),

          gender: String(
            data.get("gender") || "",
          ),

          favourite: String(
            data.get("favourite") || "",
          ),

          hobbies: String(
            data.get("hobbies") || "",
          ),

          about: String(
            data.get("about") || "",
          ),

          spotify: String(
            data.get("spotify") || "",
          ),

          specialMemory: String(
            data.get("specialMemory") || "",
          ),

          profilePhotoUrl:
            slamProfilePhotoUrl,

          photos: [],
        };

        await onSaveSlam(
          person,
          isCreate ? "create" : "edit",
        );
      } else {
        const uploadedPhotos =
          await Promise.all(
            files.map(async (photo) => ({
              url: photo.file
                ? await uploadImage(
                    photo.file,
                    "memories",
                  )
                : photo.url,

              caption: photo.caption,
            })),
          );

        await onSaveEntry({
          id: editing?.id || 0,

          name: String(
            data.get("yourName") || "",
          ),

          relationship: String(
            data.get("relationship") || "",
          ),

          since: String(
            data.get("since") || "",
          ),

          rating: Number(
            data.get("rating"),
          ),

          bestFriend:
            data.get("bestFriend") ===
            "yes",

          avatar:
            friendProfilePhotoUrl,

          profilePhotoUrl:
            friendProfilePhotoUrl,

          message: String(
            data.get("message") || "",
          ),

          memory: String(
            data.get("memory") || "",
          ),

          song:
            spotify ||
            "No anthem added",

          dedication: String(
            data.get("dedication") || "",
          ),

          photos: uploadedPhotos,
        });
      }
    } catch (err: any) {
      console.error(err);

      const message =
        err.message ||
        "An error occurred while saving to the backend.";

      setError(message);
      onNotify(message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-5 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-xl overflow-auto rounded-[2rem] border border-border bg-background p-6 shadow-2xl md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              {isSlam
                ? "make your own corner"
                : "leave something lovely"}
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              {isSlam
                ? mode === "editSlam"
                  ? "Edit your SlamBook"
                  : "Create your SlamBook"
                : mode === "editFriend"
                  ? "Edit your entry"
                  : "Fill their SlamBook"}
            </h2>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-full bg-muted p-2"
            disabled={saving}
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={submit}
          className="mt-7 space-y-4"
        >
          {isSlam ? (
            <>
              <Field
                name="fullName"
                label="Full name"
                placeholder="Your full name"
                required
                defaultValue={
                  mode === "editSlam"
                    ? editingSlam?.name
                    : ""
                }
              />

              <Field
                name="nickname"
                label="Nickname"
                placeholder="What do your people call you?"
                defaultValue={
                  mode === "editSlam"
                    ? editingSlam?.handle?.replace(
                        /^@/,
                        "",
                      )
                    : ""
                }
              />

              <ProfilePhotoField
                initialUrl={
                  slamProfilePhotoUrl
                }
                label="Profile photo"
                onUpload={
                  uploadProfilePhoto
                }
                onUploaded={(url) =>
                  setSlamProfilePhotoUrl(
                    url,
                  )
                }
              />

              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  name="dob"
                  label="Date of birth"
                  placeholder="YYYY-MM-DD"
                  icon={
                    <CalendarDays size={16} />
                  }
                  defaultValue={
                    mode === "editSlam"
                      ? editingSlam?.dob
                      : ""
                  }
                />

                <Field
                  name="gender"
                  label="Gender / pronouns"
                  placeholder="she / her, he / him..."
                  defaultValue={
                    mode === "editSlam"
                      ? editingSlam?.gender
                      : ""
                  }
                />
              </div>

              <Field
                name="favourite"
                label="Favourite colour"
                placeholder="The colour that feels like you"
                defaultValue={
                  mode === "editSlam"
                    ? editingSlam?.favourite
                    : ""
                }
              />

              <Field
                name="hobbies"
                label="Hobbies"
                placeholder="What are you always doing?"
                defaultValue={
                  mode === "editSlam"
                    ? editingSlam?.hobbies
                    : ""
                }
              />

              <TextField
                name="about"
                label="About me"
                placeholder="A few words from your heart..."
                required
                defaultValue={
                  mode === "editSlam"
                    ? editingSlam?.about
                    : ""
                }
              />

              <Field
                name="spotify"
                label="Spotify anthem"
                placeholder="https://open.spotify.com/track/..."
                icon={
                  <Music2 size={16} />
                }
                defaultValue={
                  mode === "editSlam"
                    ? editingSlam?.spotify
                    : ""
                }
              />

              <TextField
                name="specialMemory"
                label="Special memory"
                placeholder="A tiny story people should know..."
                defaultValue={
                  mode === "editSlam"
                    ? editingSlam?.specialMemory
                    : ""
                }
              />
            </>
          ) : (
            <>
              <Field
                name="yourName"
                label="Your name"
                placeholder="How should they remember you?"
                required
                defaultValue={
                  editing?.name
                }
              />

              <ProfilePhotoField
                initialUrl={
                  friendProfilePhotoUrl
                }
                label="Your profile photo (optional)"
                onUpload={
                  uploadProfilePhoto
                }
                onUploaded={(url) =>
                  setFriendProfilePhotoUrl(
                    url,
                  )
                }
              />

              <Field
                name="relationship"
                label="Relationship"
                placeholder="best friend, cousin, classmate..."
                required
                defaultValue={
                  editing?.relationship
                }
              />

              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  name="since"
                  label="Friendship since"
                  placeholder="YYYY-MM-DD or YYYY"
                  required
                  defaultValue={
                    editing?.since
                  }
                />

                <Field
                  name="rating"
                  label="Friendship rating (1–10)"
                  placeholder="10"
                  required
                  type="number"
                  min="1"
                  max="10"
                  defaultValue={
                    editing?.rating
                  }
                />
              </div>

              <label className="block text-sm font-semibold">
                Best friend?

                <select
                  name="bestFriend"
                  defaultValue={
                    editing?.bestFriend
                      ? "yes"
                      : "no"
                  }
                  className="mt-2 w-full rounded-xl border border-border bg-card px-4 py-3 outline-none focus:border-primary"
                >
                  <option value="no">
                    No, but very special
                  </option>

                  <option value="yes">
                    Yes, absolutely
                  </option>
                </select>
              </label>

              <Field
                name="spotify"
                label="Our Spotify anthem"
                placeholder="https://open.spotify.com/track/..."
                icon={
                  <Music2 size={16} />
                }
                defaultValue={
                  editing?.song?.startsWith(
                    "http",
                  )
                    ? editing.song
                    : ""
                }
                value={spotify}
                onChange={setSpotify}
              />

              <TextField
                name="dedication"
                label="Song dedication"
                placeholder="Why this song is us..."
                defaultValue={
                  editing?.dedication
                }
              />

              <TextField
                name="memory"
                label="Shared memory"
                placeholder="The story you still tell everyone..."
                required
                defaultValue={
                  editing?.memory
                }
              />

              <TextField
                name="message"
                label="Personal message"
                placeholder="Say the thing you never text..."
                required
                defaultValue={
                  editing?.message
                }
              />

              <Upload
                onChange={addPhotos}
                label="Memory photos with captions"
                photos={files}
                onChangeCaption={
                  changeCaption
                }
                onRemove={removePhoto}
              />

              {spotify &&
                /^https?:\/\/(open\.)?spotify\.com\//.test(
                  spotify,
                ) && (
                  <div className="rounded-2xl bg-accent/50 p-4 text-sm">
                    <div className="flex items-center gap-2 font-semibold text-primary">
                      <Music2 size={16} />
                      Spotify track preview
                    </div>

                    <p className="mt-1 truncate text-muted-foreground">
                      {spotify}
                    </p>

                    {spotify.includes(
                      "/track/",
                    ) && (
                      <iframe
                        title="Spotify track preview"
                        src={`https://open.spotify.com/embed/track/${spotify
                          .split("/track/")[1]
                          ?.split("?")[0]}`}
                        className="mt-3 h-20 w-full rounded-xl border-0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                      />
                    )}
                  </div>
                )}
            </>
          )}

          {error && (
            <p
              role="alert"
              className="rounded-xl bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive"
            >
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-border px-5 py-3 font-semibold"
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : mode === "editFriend" ||
                    mode === "editSlam"
                  ? "Save changes"
                  : isSlam
                    ? "Create SlamBook"
                    : "Add to the book"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =========================
// FIELD
// =========================

function Field({
  name,
  label,
  placeholder,
  required,
  icon,
  type = "text",
  defaultValue,
  min,
  max,
  value,
  onChange,
}: {
  name: string;
  label: string;
  placeholder: string;
  required?: boolean;
  icon?: React.ReactNode;
  type?: string;
  defaultValue?: string | number;
  min?: string;
  max?: string;
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-semibold">
      {label}

      {required && (
        <span className="ml-1 text-primary">
          *
        </span>
      )}

      <span className="relative mt-2 block">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-3.5 text-muted-foreground">
            {icon}
          </span>
        )}

        <input
          name={name}
          required={required}
          type={type}
          min={min}
          max={max}
          {...(value !== undefined
            ? {
                value,
                onChange: (
                  e: React.ChangeEvent<HTMLInputElement>,
                ) =>
                  onChange?.(
                    e.target.value,
                  ),
              }
            : {
                defaultValue,
              })}
          className={`w-full rounded-xl border border-border bg-card px-4 py-3 outline-none focus:border-primary ${
            icon ? "pl-10" : ""
          }`}
          placeholder={placeholder}
        />
      </span>
    </label>
  );
}

// =========================
// TEXT FIELD
// =========================

function TextField({
  name,
  label,
  placeholder,
  required,
  defaultValue,
}: {
  name: string;
  label: string;
  placeholder: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <label className="block text-sm font-semibold">
      {label}

      {required && (
        <span className="ml-1 text-primary">
          *
        </span>
      )}

      <textarea
        name={name}
        required={required}
        defaultValue={defaultValue}
        rows={3}
        className="mt-2 w-full resize-none rounded-xl border border-border bg-card px-4 py-3 outline-none focus:border-primary"
        placeholder={placeholder}
      />
    </label>
  );
}

// =========================
// PROFILE PHOTO
// =========================

function ProfilePhotoField({
  initialUrl,
  label = "Profile photo",
  onUpload,
  onUploaded,
}: {
  initialUrl: string;
  label?: string;
  onUpload?: (
    file: File,
  ) => Promise<string>;
  onUploaded?: (
    url: string,
  ) => void;
}) {
  const [url, setUrl] =
    useState(initialUrl);

  const [uploading, setUploading] =
    useState(false);

  useEffect(() => {
    setUrl(initialUrl);
  }, [initialUrl]);

  const changePhoto = async (
    list: FileList | null,
  ) => {
    const file = list?.[0];

    if (!file) return;

    const previewUrl =
      URL.createObjectURL(file);

    setUrl(previewUrl);

    if (!onUpload) {
      onUploaded?.(previewUrl);
      return;
    }

    setUploading(true);

    try {
      const uploadedUrl =
        await onUpload(file);

      setUrl(uploadedUrl);
      onUploaded?.(uploadedUrl);
    } catch (error) {
      console.error(error);

      setUrl(initialUrl);
      onUploaded?.(initialUrl);
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = () => {
    setUrl("");
    onUploaded?.("");
  };

  return (
    <div className="mb-4 block text-sm font-semibold">
      <span>{label}</span>

      <input
        type="hidden"
        name="profilePhotoUrl"
        value={url}
        readOnly
      />

      {url ? (
        <div className="mt-2 flex items-center gap-3 rounded-xl bg-muted p-2">
          <img
            src={url}
            alt="Profile photo preview"
            className="size-16 rounded-lg object-cover"
          />

          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-sm text-muted-foreground">
              {uploading
                ? "Uploading photo..."
                : "Photo uploaded"}
            </span>

            <label className="cursor-pointer text-xs font-bold text-primary">
              {uploading
                ? "Uploading..."
                : "Change photo"}

              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  changePhoto(
                    e.target.files,
                  )
                }
                className="sr-only"
                disabled={uploading}
              />
            </label>
          </div>

          <button
            type="button"
            onClick={removePhoto}
            aria-label="Remove profile photo"
            className="shrink-0 rounded-full bg-destructive/10 p-1.5 text-destructive hover:bg-destructive/20"
            disabled={uploading}
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <label className="mt-2 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-primary/40 bg-accent/30 px-4 py-4 text-sm text-muted-foreground">
          <ImagePlus
            size={18}
            className="text-primary"
          />

          Add a profile photo

          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              changePhoto(
                e.target.files,
              )
            }
            className="sr-only"
            disabled={uploading}
          />
        </label>
      )}
    </div>
  );
}

// =========================
// MEMORY PHOTO UPLOAD
// =========================

function Upload({
  label,
  onChange,
  photos,
  onChangeCaption,
  onRemove,
}: {
  label: string;
  onChange: (
    files: FileList | null,
  ) => void;
  photos: Photo[];
  onChangeCaption: (
    index: number,
    caption: string,
  ) => void;
  onRemove: (
    index: number,
  ) => void;
}) {
  return (
    <div className="block text-sm font-semibold">
      <span>{label}</span>

      <label className="mt-2 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-primary/40 bg-accent/30 px-4 py-4 text-sm text-muted-foreground">
        <ImagePlus
          size={18}
          className="text-primary"
        />

        Add photos and captions

        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => {
            onChange(e.target.files);
            e.currentTarget.value = "";
          }}
          className="sr-only"
        />
      </label>

      {photos.length > 0 && (
        /*
         * Upload preview also follows the same layout:
         * BIG PHOTO LEFT + CAPTION RIGHT
         * ONE PHOTO BELOW ANOTHER.
         */
        <div className="mt-5 flex flex-col gap-4">
          {photos.map((photo, index) => (
            <div
              key={`${photo.url}-${index}`}
              className="w-full rounded-2xl border border-primary/20 bg-muted/30 p-3"
            >
              <div className="flex items-center gap-4">
                {/* BIG PHOTO */}

                <div className="h-[150px] w-[200px] shrink-0 overflow-hidden rounded-2xl border border-primary/20 bg-background">
                  <img
                    src={photo.url}
                    alt={`Memory photo ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* CAPTION */}

                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <input
                    aria-label={`Caption for photo ${
                      index + 1
                    }`}
                    value={photo.caption}
                    onChange={(e) =>
                      onChangeCaption(
                        index,
                        e.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-border bg-background px-3 py-3 text-sm outline-none focus:border-primary"
                    placeholder="Caption this moment..."
                  />

                  <p className="truncate px-1 text-xs text-muted-foreground">
                    {photo.url.startsWith("blob:")
                      ? "Local file — ready to upload"
                      : "Uploaded photo"}
                  </p>
                </div>

                {/* REMOVE */}

                <button
                  type="button"
                  onClick={() =>
                    onRemove(index)
                  }
                  aria-label={`Remove photo ${
                    index + 1
                  }`}
                  className="shrink-0 self-start rounded-full bg-destructive/10 p-1.5 text-destructive hover:bg-destructive/20"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}