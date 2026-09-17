---
title: "Most integration projects do not fail in the code"
tag: "Integration"
series: "Integration readiness"
date: 2026-08-14
status: published
pinned: true
standfirst: "The expensive mistakes are made in the weeks before anyone opens an editor, while two teams agree on a word that means different things to each of them."
sourceLine: "Author's own observations, 2019–2026. Figures are estimates and marked as such."
paperSlug: "readiness"
paperNote: "The long version, with the workshop agenda and the description test in full."
---

Most integration projects do not fail in the code. They fail in the eight weeks before anyone writes any, while two teams agree on a word that means different things to each of them. The code is then written correctly, against the wrong agreement, and the bill arrives later.

This is not a story about bad engineers. In my experience the engineering is usually the most careful part of the whole undertaking. It is a story about a meeting in which everyone nodded.

## Where the cost actually sits

Ask a team to account for an integration overrun and you will get a list of technical causes: an undocumented API, a rate limit, a character encoding. Ask again in two years, when nobody is defending anything, and the list changes. What you hear then is that "order" meant the confirmed order in one system and the requested order in the other, and that the reconciliation job built to bridge the two is still running.

The reason this is expensive is compounding. A defect is found by a test. A definition is found by a quarterly report that does not add up, which is a slower and more political instrument.

> A defect is caught by a test. A bad definition is caught by a board pack.

## The description test

There is a cheap way to find these before they cost anything. Write down what each field means in one sentence, without naming the system it comes from. Then hand the description to someone who was not in the meeting and ask them to say what it is.

- If they can say it back to you, you have a definition.
- If they ask which system you mean, you have a mapping and not a definition.
- If two people in the room answer differently, stop and stay in the room.

!! The useful sentence :: You do not need a data governance programme to do this. You need one page per interface and the discipline to write it before the sprint that consumes it.

## What to do on Monday

Take the interface you are most confident about and run the description test on it. Confidence is the signal here: the interfaces people argue about are already being examined. The ones nobody questions are where the assumption is hiding.
