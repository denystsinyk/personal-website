
export default function Home() {
  return (
    <>
      <canvas id="snow" aria-hidden="true"></canvas>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="page" id="top">
        <header className="site-header">
          <nav aria-label="Main navigation">
            <a href="#about">about</a>
            <a href="#work">work</a>
            <a href="#projects">projects</a>
            <a href="mailto:denystsinyk@gmail.com">
              email <span aria-hidden="true">↗</span>
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
                <h1>
                  Denys Tsinyk
                </h1>
                <p className="lede">
                  I’m a CS major at Pitt and enjoy building cool things, both physical and software-based. When I’m not building something, I’m usually playing video games or doing something that gets me far away from my laptop.
                </p>
                <p className="now">
                  <span className="k">summer ’26</span> &mdash; Trust &amp;
                  Safety @ <b>Character.AI</b>
                </p>
                <p className="now">
                  <span className="k">next</span> &mdash; graduating december 2027
                  &middot; open to full-time roles :)
                </p>
              </div>
              <figure className="me">
                <img
                  src="./assets/denystsinyk.jpg"
                  alt="Denys at SteelHacks"
                  width="5039"
                  height="4031"
                />
              </figure>
            </div>
          </div>

          <div className="divider" aria-hidden="true">
            <div className="shelf">
              <img
                    src="./assets/shelf.png"
                alt="A shelf of my favorite things"
                width="1792"
                height="742"
                loading="lazy"
              />
              <div className="lamp-beam"></div>
              <div className="shelf-floor"></div>
            </div>
          </div>

          <section id="about">
            <h2>About</h2>

            <p>
              CS major at the University of Pittsburgh. I TA and peer tutor for
              Data Structures &amp; Algorithms, and I am a 2x Executive Director of{' '}
              <a href="https://steelhacks.org/" target="_blank" rel="noopener noreferrer">
                SteelHacks
              </a>.{' '}
              I am also a former officer of
              {' '}
              <a href="https://pittcsc.org/" target="_blank" rel="noopener noreferrer">
                PittCSC
              </a>.
            </p>

            <p>
              I grew up loving technology, started coding in high school, and eventually
              followed that interest into computer science in college. Since then, I have
              especially enjoyed working in security and safety, including work at the{' '}
              <a href="https://www.nfl.com/" target="_blank" rel="noopener noreferrer">
               NFL
              </a>
              {' '}and{' '}
              <a href="https://character.ai/" target="_blank" rel="noopener noreferrer">
                Character.AI
              </a>.
            </p>
            <div className="offclock-heading">
              <h3>Off the clock</h3>
              <span>snow, trails, mountains &amp; soccer</span>
            </div>
            <div className="life-gallery">
              <figure className="life-photo">
                <div className="life-photo-frame life-photo-snowboard">
                  <img
                    src="./assets/snowboarding.jpg"
                    alt="Snowboarding on a sunny winter day"
                    width="2880"
                    height="2160"
                    loading="lazy"
                  />
                </div>
                <figcaption>snowboarding</figcaption>
              </figure>
              <figure className="life-photo life-photo-hike">
                <div className="life-photo-frame">
                  <img
                    src="./assets/hiking.jpg"
                    alt="Hiking a forest trail with mountains in the distance"
                    width="2160"
                    height="2880"
                    loading="lazy"
                  />
                </div>
                <figcaption>finding a trail</figcaption>
              </figure>
              <figure className="life-photo life-photo-mountain">
                <div className="life-photo-frame">
                  <img
                    src="./assets/mountain.jpg"
                    alt="A mountain view during a hike"
                    width="2880"
                    height="2160"
                    loading="lazy"
                  />
                </div>
                <figcaption>somewhere up high</figcaption>
              </figure>
              <figure className="life-photo">
                <div className="life-photo-frame">
                  <img
                    src="./assets/soccer.jpg"
                    alt="My soccer team celebrating with a cup"
                    width="2880"
                    height="2160"
                    loading="lazy"
                  />
                </div>
                <figcaption>soccer</figcaption>
              </figure>
            </div>
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

      <script src="./site.js" defer />
    </>
  );
}
