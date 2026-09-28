
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
                  src="./assets/denystsinyk-portrait.webp"
                  alt="Denys at SteelHacks"
                  width="864"
                  height="1080"
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
              <h3>In my free time</h3>
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
              </figure>
            </div>
          </section>

          <section id="work">
            <h2>Work</h2>

            <article className="job">
              <div className="job-head">
                <h3>Character.AI</h3>
                <span className="leader"></span>
                <span className="dates">Summer 2026 - present</span>
              </div>
              <p className="role">
                Software Engineer Intern | Trust &amp; Safety
              </p>
              <p>
                Product and Operational Safety
              </p>
            </article>

            <article className="job">
              <div className="job-head">
                <h3>National Football League</h3>
                <span className="leader"></span>
                <span className="dates">Summer 2025</span>
              </div>
              <p className="role">Software Engineer Intern | InfoSec</p>
              <p>
                Security Operations
              </p>
            </article>

            <article className="job">
              <div className="job-head">
                <h3>MedPath</h3>
                <span className="leader"></span>
                <span className="dates">Spring 2025</span>
              </div>
              <p className="role">Software Engineer Intern</p>
              <p>
                Medical Education Platform
              </p>
            </article>

            <article className="job">
              <div className="job-head">
                <h3>University of Pittsburgh</h3>
                <span className="leader"></span>
                <span className="dates">Fall 2025 - present</span>
              </div>
              <p className="role">
                Teaching Assistant
              </p>
              <p>
                Data Structures and Algorithms
              </p>
            </article>
          </section>

          <section id="projects">
            <h2>Projects</h2>
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
                  Never miss an AMEX benefit again
                </p>
              </div>
            </a>
            <a
              className="project-card"
              href="https://github.com/denystsinyk/Pitt2PIT"
            >
              <span className="project-number">02 /</span>
              <div>
                <h3>
                  Pitt2PIT <span aria-hidden="true">↗</span>
                </h3>
                <p>
                  Cheap rides for Pitt Students
                </p>
              </div>
            </a>
            <p className="more-projects">
              <a href="https://github.com/denystsinyk">
                See all projects on GitHub <span aria-hidden="true">↗</span>
              </a>
            </p>
          </section>

          <section id="contact">
            <h2>Info</h2>
            <ul className="contact-list">
              <li>
                <span className="label">email</span>
                <a href="mailto:denystsinyk@gmail.com">denystsinyk@gmail.com</a>
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

        </main>
        <footer>
          <div className="foot-row">
            <span>
              &copy; {new Date().getFullYear()} Denys Tsinyk
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
        </footer>
      </div>

      <Script src="./site.js" strategy="afterInteractive" />
    </>
  );
}
