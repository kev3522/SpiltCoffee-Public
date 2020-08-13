from .definitions import platform_map


def names_to_enums(names):
    return [str(platform_map[name]) for name in names]
