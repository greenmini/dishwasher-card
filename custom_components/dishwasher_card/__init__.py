"""Custom integration that registers the dishwasher-card Lovelace card.

Install via HACS (integration) or manually into ``custom_components``.
Once loaded, the card JS is served by Home Assistant itself and injected
into every frontend page, so no manual Lovelace resource is needed.
"""

from __future__ import annotations

import logging
from pathlib import Path

from homeassistant.components import frontend
from homeassistant.core import HomeAssistant
from homeassistant.helpers.typing import ConfigType

DOMAIN = "dishwasher_card"
_LOGGER = logging.getLogger(__name__)

# URL under which Home Assistant serves the card JavaScript
STATIC_URL = "/static/dishwasher_card/dishwasher-card.js"


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up the dishwasher-card integration."""
    card_file = Path(__file__).parent / "dishwasher-card.js"

    # 1. serve the card JS through Home Assistant's own static handler
    try:
        from homeassistant.http import StaticPathConfig

        await hass.http.async_register_static_paths(
            [StaticPathConfig(STATIC_URL, str(card_file), False)]
        )
    except Exception:  # noqa: BLE001 - fall back for older HA versions
        hass.http.register_static_path(STATIC_URL, str(card_file), cache_headers=False)

    # 2. inject the module into every frontend page
    extra = hass.data.get(frontend.DATA_EXTRA_MODULE_URL)
    if extra is not None:
        if hasattr(extra, "add"):
            extra.add(STATIC_URL)
        else:
            extra.append(STATIC_URL)
        _LOGGER.debug("dishwasher-card registered at %s", STATIC_URL)
    else:
        _LOGGER.warning(
            "frontend extra-module store not available; "
            "the dishwasher-card will not be injected automatically"
        )

    return True
