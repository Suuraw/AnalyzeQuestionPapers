import { Github, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container flex flex-col items-center gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-1 items-center justify-center gap-4 md:justify-start ml-2">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Maximize your last-minute study sessions!{" "}
            <img
              src="https://img.icons8.com/ios-filled/50/ffffff/rocket.png"
              alt="Rocket"
              className="inline-block w-5 h-5 align-middle"
            />
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 mr-2">
          <a
            href="https://www.linkedin.com/in/sujay-kumar-4b85b5252/"
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-primary"
          >
            <Linkedin className="h-5 w-5" />
            <span className="sr-only">Linkedin</span>
          </a>
          <a
            href="https://github.com/Suuraw"
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-primary"
          >
            <Github className="h-5 w-5" />
            <span className="sr-only">GitHub</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
