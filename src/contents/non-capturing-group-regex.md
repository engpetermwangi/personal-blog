---
author: Peter Mwangi
datetime: 2023-01-02T12:05:01Z
title: Non-capturing groups in regex
slug: non-capturing-group-regex
featured: true
draft: false
tags:
  - regex
ogImage: ""
description: Non-capturing groups in regex.
---

Matching a string using a regex that contains the groups construct `()` returns a set of matching groups found in the string as part of the result.

For example, `(\w+)`, matches a one or more word character sequence and returns it in a set of matched groups.

Non-capturing groups, use the `(?:)` construct.

For example, `(?:\w+)` contains a non-capturing group. It matches the provided string using the regex pattern after `?:` but doesn't include the group in the resulting set of matched groups.

```python
import re

string1 = "http://stackoverflow.com/"
string2 = "https://stackoverflow.com/questions/tagged/regex"

# to match the protocal, domain and path in regular groups
regex1 = r"(https?|ftp)://([^/\r\n]+)(/[^\r\n]*)?"

result = re.search(regex1, string1)

print(result.groups())
# ("http", "stackoverflow.com", "/")

result = re.search(regex1, string2)

print(result.groups())
# ("https", "stackoverflow.com", "/questions/tagged/regex")

# to match the protocal in a non-capturing group, but the domain and path in a regular group
regex2 = r"(?:https?|ftp)://([^/\r\n]+)(/[^\r\n]*)?"

result = re.search(regex2, string1)

print(result.groups())
# ("stackoverflow.com", "/")

result = re.search(regex2, string2)

print(result.groups())
# ("stackoverflow.com", "/questions/tagged/regex")
```
