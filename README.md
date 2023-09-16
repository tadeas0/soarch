# Soarch

**Visit https://soarch.tk, to see a live version of the app**

## What is it?

Soarch is a musical search engine that allows you to search for songs using melodies as queries. It can be particularly useful when you have a melody stuck in your head but can't quite figure out where you've heard it. It was originally developed as part of my Master's thesis.

## How does it work?

Under the hood, Soarch operates differently from many other music search engines. Instead of working with audio representations of songs, it utilizes symbolic representation, using MIDI files to represent songs. Soarch extracts all available melodies from each song, including bass lines, vocal lines, guitar solos, and more, and then attempts to match them with the user's query.

This approach enables Soarch to recognize songs even if the query doesn't exactly match the original. In other words, users can input melodies that may contain errors, and Soarch should still, to some extent, be able to identify them.

## How to run it?

The entire application is dockerized. To run it, use the following commands:

```
docker-compose build
docker-compose up -d
```