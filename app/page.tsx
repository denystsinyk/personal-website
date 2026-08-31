import Image from 'next/image';
import Script from 'next/script';

export default function Home() {
  return (
    <>
      <canvas id="snow" aria-hidden="true"></canvas>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="page" id="top">
        <header className="site-header">
          <a className="home-link" href="#top">
            DT<span>.</span>
          </a>
          <nav aria-label="Main navigation">
            <a href="#about">about</a>
            <a href="#work">work</a>
            <a href="#projects">projects</a>
            <a href="#contact">
              say hello <span aria-hidden="true">↗</span>
            </a>
          </nav>
          <button
            className="header-theme"
            data-theme-toggle
            aria-label="Toggle color theme"
          >
            day / night
          </button>
        </header>
        <main id="main">
          <div className="hero">
            <div className="hero-flex">
              <div className="hero-text">
                <p className="eyebrow">
                  SOFTWARE, SAFETY &amp; A LITTLE FRESH AIR
                </p>
                <h1>
                  Denys Tsinyk<span className="dot">.</span>
                </h1>
                <p className="lede">
                  I’m studying computer science at Pitt. I like building things
                  that <span className="mark">keep people safe online</span>,
                  and being very far from a screen the rest of the time.
                </p>
                <p className="now">
                  <span className="k">summer ’26</span> &mdash; Trust &amp;
                  Safety @ <b>Character.AI</b>
                </p>
                <p className="now">
                  <span className="k">next</span> &mdash; graduating spring 2027
                  &middot; open to full-time trust &amp; safety / backend roles
                </p>
              </div>
              <figure className="me">
                <Image
                  unoptimized
                  src="/assets/me.jpg"
                  alt="Denys as a kid, already in a suit vest"
                  width="728"
                  height="1296"
                />
                <figcaption>preparing for this since ~2011</figcaption>
              </figure>
            </div>
          </div>

          <div className="divider" aria-hidden="true">
            <div className="shelf">
              <Image
                unoptimized
                src="/assets/shelf.png"
                alt="A shelf of my favorite things: a snowboard, computer, bonsai, games, and hiking boots"
                width="1792"
                height="742"
                loading="lazy"
              />
              <div className="lamp-beam"></div>
              <div className="shelf-floor"></div>
            </div>
            <span className="scribble divider-note">
              the essentials, more or less
            </span>
          </div>

          <section id="about">
            <h2>About</h2>
            <p>
              CS student at the University of Pittsburgh with a business minor.
              I TA Data Structures &amp; Algorithms and coordinate events for
              PittCSC, which mostly means convincing companies that students are
              worth the pizza budget.
            </p>
            <p>
              I keep ending up at the intersection of software and safety
              &mdash; security automation at{' '}
              <a className="tip" href="https://www.nfl.com/">
                the NFL
                <span className="tip-box" role="tooltip">
                  firewall rule reviews, automated away
                </span>
              </a>
              , Trust &amp; Safety tooling at
              <a className="tip" href="https://character.ai/">
                Character.AI
                <span className="tip-box" role="tooltip">
                  Go services + React tools for the T&amp;S team
                </span>
              </a>
              . Go on the backend, React when someone needs to click on things.
            </p>
            <p className="offclock-lead">Off the clock &mdash;</p>
            <ul className="offclock">
              <li>
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <rect
                    x="2.5"
                    y="9.5"
                    width="19"
                    height="5"
                    rx="2.5"
                    transform="rotate(-14 12 12)"
                  />
                  <path d="M9.2,8.6 L10.4,13.5 M13.6,7.5 L14.8,12.4" />
                </svg>
                snowboarding
              </li>
              <li>
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="8.5" />
                  <path d="M12,8.5 L15.3,10.9 L14,14.7 L10,14.7 L8.7,10.9 Z" />
                  <path d="M12,8.5 V3.5 M15.3,10.9 L20.3,9.5 M14,14.7 L17,19 M10,14.7 L7,19 M8.7,10.9 L3.7,9.5" />
                </svg>
                soccer
              </li>
              <li>
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M2.5,18.5 L8.5,7.5 L12,13.5" />
                  <path d="M10.5,11 L14.5,5.5 L21.5,18.5" />
                </svg>
                trails, runs &amp; new cities
              </li>
              <li>
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M7,7.5 H17 C19.5,7.5 21.5,9.5 21.5,12 C21.5,14.5 19.5,16.5 17,16.5 C15.5,16.5 14.5,15.5 14,14.5 H10 C9.5,15.5 8.5,16.5 7,16.5 C4.5,16.5 2.5,14.5 2.5,12 C2.5,9.5 4.5,7.5 7,7.5 Z" />
                  <path d="M7,10.2 V13.8 M5.2,12 H8.8" />
                  <circle cx="16.6" cy="11" r="0.5" fill="currentColor" />
                  <circle cx="18.4" cy="13" r="0.5" fill="currentColor" />
                </svg>
                Rust &amp; Minecraft
              </li>
            </ul>
          </section>

          <section id="work">
            <h2>Work</h2>

            <article className="job">
              <div className="job-head">
                <h3>Character.AI</h3>
                <span className="leader"></span>
                <span className="dates">Summer 2026</span>
              </div>
              <p className="role">
                Software Engineering Intern, Trust &amp; Safety
              </p>
              <p>
                Go backend services and React tooling for the Trust &amp; Safety
                team.
              </p>
            </article>

            <article className="job">
              <div className="job-head">
                <h3>National Football League</h3>
                <span className="leader"></span>
                <span className="dates">2025&ndash;26</span>
              </div>
              <p className="role">Security Automation Intern</p>
              <p>
                Built automation around the league’s security infrastructure
                &mdash; firewall rule analysis and tooling that turned manual
                review work into pipelines.
              </p>
            </article>

            <article className="job">
              <div className="job-head">
                <h3>PittCSC</h3>
                <span className="leader"></span>
                <span className="dates">2025&ndash;present</span>
              </div>
              <p className="role">Events Coordinator</p>
              <p>
                Plan and run events for Pitt’s computer science club &mdash;
                tech talks, socials, and company visits.
              </p>
            </article>

            <article className="job">
              <div className="job-head">
                <h3>University of Pittsburgh</h3>
                <span className="leader"></span>
                <span className="dates">2025&ndash;present</span>
              </div>
              <p className="role">
                Teaching Assistant, Data Structures &amp; Algorithms
              </p>
              <p>
                Recitations, office hours, and explaining why the exam wants
                O(log&nbsp;n).
              </p>
            </article>
          </section>

          <section id="projects">
            <h2>Things I’ve built</h2>
            <a
              className="project-card"
              href="https://github.com/denystsinyk/worthit"
            >
              <span className="project-number">01 /</span>
              <div>
                <h3>
                  worthit <span aria-hidden="true">↗</span>
                </h3>
                <p>
                  A local dashboard that makes recurring Amex benefits easier to
                  track, using transaction data from Plaid.
                </p>
                <span className="project-tech">Python · Flask · Plaid</span>
              </div>
            </a>
            <a
              className="project-card"
              href="https://github.com/denystsinyk/WeatherCli"
            >
              <span className="project-number">02 /</span>
              <div>
                <h3>
                  WeatherCLI <span aria-hidden="true">↗</span>
                </h3>
                <p>
                  The weather for any city, right in your terminal. No ads. No
                  nonsense.
                </p>
                <span className="project-tech">
                  Command-line tools · Weather
                </span>
              </div>
            </a>
            <p className="projects-note">small things, made to be useful.</p>
          </section>

          <section id="contact">
            <h2>Let’s talk</h2>
            <p className="contact-intro">
              Something interesting to build? A good trail recommendation?
              <br />
              My inbox is open.
            </p>
            <ul className="contact-list">
              <li>
                <span className="label">email</span>
                <a href="mailto:det82@pitt.edu">det82@pitt.edu</a>
              </li>
              <li>
                <span className="label">github</span>
                <a href="https://github.com/denystsinyk">
                  github.com/denystsinyk
                </a>
              </li>
              <li>
                <span className="label">linkedin</span>
                <a href="https://www.linkedin.com/in/denystsinyk">
                  linkedin.com/in/denystsinyk
                </a>
              </li>
            </ul>
          </section>

          <div className="signoff" aria-hidden="true">
            <svg
              className="sig"
              viewBox="0 0 150 66"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M16,10 C12,22 9,34 7,45 M16,10 C34,5 46,16 41,28 C36,39 21,46 8,45" />
              <path
                d="M50,36 C57,34 58,28 52,29 C46,30 43,38 47,43 C51,47 58,42 62,37
               M66,30 C64,35 62,41 61,44 C64,37 69,31 73,32 C76,33 74,41 73,44
               M79,31 C77,36 76,42 78,44 C81,46 85,38 87,32 C85,42 82,54 75,59 C70,62 68,56 72,51
               M94,30 C90,31 88,35 91,37 C95,39 96,42 92,44 C89,45 86,44 85,42"
              />
              <path className="flourish" d="M6,56 C40,51 80,59 118,51" />
            </svg>
          </div>
        </main>
        <footer>
          <div className="foot-row">
            <span>
              &copy; {new Date().getFullYear()} Denys Tsinyk
              <svg
                className="flag"
                width="14"
                height="10"
                viewBox="0 0 14 10"
                aria-hidden="true"
              >
                <rect width="14" height="5" fill="var(--blue)" />
                <rect y="5" width="14" height="5" fill="var(--gold)" />
              </svg>
              handmade in Pittsburgh
            </span>
            <div className="footer-controls">
              <button id="weather-toggle" aria-pressed="false">
                pause weather
              </button>
              <button id="theme-toggle" aria-label="Toggle color theme">
                <span className="to-dark">night&nbsp;&darr;</span>
                <span className="to-light">day&nbsp;&uarr;</span>
              </button>
            </div>
          </div>
          <p className="eof">{'//'} end of run &mdash; lift closes at 5</p>
        </footer>
      </div>

      <Script src="/site.js" strategy="afterInteractive" />
    </>
  );
}
