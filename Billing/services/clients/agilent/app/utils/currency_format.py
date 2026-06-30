"""
Indian Rupee currency formatting helper (lakh/crore comma grouping),
used when generating Excel exports server-side. The frontend does its
own formatting for on-screen display via Intl.NumberFormat.
"""


def format_inr(amount: float) -> str:
    """Formats a number using the Indian numbering system, e.g. 3118989.76 -> '₹31,18,990'."""
    amount = round(amount)
    is_negative = amount < 0
    amount = abs(amount)
    s = str(amount)

    if len(s) <= 3:
        formatted = s
    else:
        last_three = s[-3:]
        rest = s[:-3]
        groups = []
        while len(rest) > 2:
            groups.insert(0, rest[-2:])
            rest = rest[:-2]
        if rest:
            groups.insert(0, rest)
        formatted = ",".join(groups) + "," + last_three

    sign = "-" if is_negative else ""
    return f"{sign}₹{formatted}"
