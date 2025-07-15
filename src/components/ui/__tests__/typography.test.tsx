import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import {
  Typography,
  Hero,
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  P,
  Span,
  BodyLarge,
  Small,
  Caption,
} from "../typography";

describe("Typography", () => {
  it("renders with default variant", () => {
    render(<Typography variant="p">Test content</Typography>);
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("renders with custom className", () => {
    render(
      <Typography variant="p" className="custom-class">
        Test content
      </Typography>,
    );
    expect(screen.getByText("Test content")).toHaveClass("custom-class");
  });

  it("renders with custom as prop", () => {
    render(
      <Typography variant="p" as="div">
        Test content
      </Typography>,
    );
    expect(screen.getByText("Test content").tagName).toBe("DIV");
  });

  it("renders h1 variant correctly", () => {
    render(<Typography variant="h1">Heading 1</Typography>);
    const element = screen.getByText("Heading 1");
    expect(element.tagName).toBe("H1");
    expect(element).toHaveClass("text-4xl");
  });

  it("renders h2 variant correctly", () => {
    render(<Typography variant="h2">Heading 2</Typography>);
    const element = screen.getByText("Heading 2");
    expect(element.tagName).toBe("H2");
    expect(element).toHaveClass("text-3xl");
  });

  it("renders h3 variant correctly", () => {
    render(<Typography variant="h3">Heading 3</Typography>);
    const element = screen.getByText("Heading 3");
    expect(element.tagName).toBe("H3");
    expect(element).toHaveClass("text-2xl");
  });

  it("renders h4 variant correctly", () => {
    render(<Typography variant="h4">Heading 4</Typography>);
    const element = screen.getByText("Heading 4");
    expect(element.tagName).toBe("H4");
    expect(element).toHaveClass("text-xl");
  });

  it("renders h5 variant correctly", () => {
    render(<Typography variant="h5">Heading 5</Typography>);
    const element = screen.getByText("Heading 5");
    expect(element.tagName).toBe("H5");
    expect(element).toHaveClass("text-lg");
  });

  it("renders h6 variant correctly", () => {
    render(<Typography variant="h6">Heading 6</Typography>);
    const element = screen.getByText("Heading 6");
    expect(element.tagName).toBe("H6");
    expect(element).toHaveClass("text-base");
  });

  it("renders p variant correctly", () => {
    render(<Typography variant="p">Paragraph text</Typography>);
    const element = screen.getByText("Paragraph text");
    expect(element.tagName).toBe("P");
    expect(element).toHaveClass("text-base");
  });

  it("renders span variant correctly", () => {
    render(<Typography variant="span">Span text</Typography>);
    const element = screen.getByText("Span text");
    expect(element.tagName).toBe("SPAN");
    expect(element).toHaveClass("text-base");
  });

  it("renders body variant correctly", () => {
    render(<Typography variant="body">Body text</Typography>);
    const element = screen.getByText("Body text");
    expect(element.tagName).toBe("P");
    expect(element).toHaveClass("text-base");
  });

  it("renders caption variant correctly", () => {
    render(<Typography variant="caption">Caption text</Typography>);
    const element = screen.getByText("Caption text");
    expect(element.tagName).toBe("P");
    expect(element).toHaveClass("text-sm");
  });

  it("applies base styles", () => {
    render(<Typography variant="p">Test content</Typography>);
    expect(screen.getByText("Test content")).toHaveClass("text-black");
  });

  it("applies variant styles", () => {
    render(<Typography variant="h1">Test content</Typography>);
    const element = screen.getByText("Test content");
    expect(element).toHaveClass("font-serif", "font-bold");
  });
});

describe("Typography Components", () => {
  describe("Hero", () => {
    it("renders hero component", () => {
      render(<Hero>Hero content</Hero>);
      const element = screen.getByText("Hero content");
      expect(element.tagName).toBe("H1");
      expect(element).toHaveClass("text-hero");
    });

    it("applies custom className", () => {
      render(<Hero className="custom-hero">Hero content</Hero>);
      expect(screen.getByText("Hero content")).toHaveClass("custom-hero");
    });
  });

  describe("H1", () => {
    it("renders h1 component", () => {
      render(<H1>Heading 1</H1>);
      const element = screen.getByText("Heading 1");
      expect(element.tagName).toBe("H1");
      expect(element).toHaveClass("text-h1");
    });
  });

  describe("H2", () => {
    it("renders h2 component", () => {
      render(<H2>Heading 2</H2>);
      const element = screen.getByText("Heading 2");
      expect(element.tagName).toBe("H2");
      expect(element).toHaveClass("text-h2");
    });
  });

  describe("H3", () => {
    it("renders h3 component", () => {
      render(<H3>Heading 3</H3>);
      const element = screen.getByText("Heading 3");
      expect(element.tagName).toBe("H3");
      expect(element).toHaveClass("text-h3");
    });
  });

  describe("H4", () => {
    it("renders h4 component", () => {
      render(<H4>Heading 4</H4>);
      const element = screen.getByText("Heading 4");
      expect(element.tagName).toBe("H4");
      expect(element).toHaveClass("text-xl");
    });
  });

  describe("H5", () => {
    it("renders h5 component", () => {
      render(<H5>Heading 5</H5>);
      const element = screen.getByText("Heading 5");
      expect(element.tagName).toBe("H5");
      expect(element).toHaveClass("text-lg");
    });
  });

  describe("H6", () => {
    it("renders h6 component", () => {
      render(<H6>Heading 6</H6>);
      const element = screen.getByText("Heading 6");
      expect(element.tagName).toBe("H6");
      expect(element).toHaveClass("text-base");
    });
  });

  describe("P", () => {
    it("renders p component", () => {
      render(<P>Paragraph text</P>);
      const element = screen.getByText("Paragraph text");
      expect(element.tagName).toBe("P");
      expect(element).toHaveClass("text-body");
    });
  });

  describe("Span", () => {
    it("renders span component", () => {
      render(<Span>Span text</Span>);
      const element = screen.getByText("Span text");
      expect(element.tagName).toBe("SPAN");
      expect(element).toHaveClass("text-body");
    });
  });

  describe("BodyLarge", () => {
    it("renders body large component", () => {
      render(<BodyLarge>Body large text</BodyLarge>);
      const element = screen.getByText("Body large text");
      expect(element.tagName).toBe("P");
      expect(element).toHaveClass("text-body-large");
    });
  });

  describe("Small", () => {
    it("renders small component", () => {
      render(<Small>Small text</Small>);
      const element = screen.getByText("Small text");
      expect(element.tagName).toBe("P");
      expect(element).toHaveClass("text-small");
    });
  });

  describe("Caption", () => {
    it("renders caption component", () => {
      render(<Caption>Caption text</Caption>);
      const element = screen.getByText("Caption text");
      expect(element.tagName).toBe("P");
      expect(element).toHaveClass("text-caption");
    });
  });
});
