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

    # 1. serve the card JS through Home Assistant's own static handler.
    #    Try each API generation independently; never let setup fail.
    try:
        from homeassistant.components.http import StaticPathConfig

        await hass.http.async_register_static_paths(
            [StaticPathConfig(STATIC_URL, str(card_file), False)]
        )
        _LOGGER.debug("dishwasher_card: static path registered (new API)")
    except Exception as err:  # noqa: BLE001 - fall back for older HA versions
        _LOGGER.warning(
            "dishwasher_card: new static API failed (%s), trying legacy", err
        )
        try:
            hass.http.register_static_path(
                STATIC_URL, str(card_file), cache_headers=False
            )
            _LOGGER.debug("dishwasher_card: static path registered (legacy API)")
        except Exception as err2:  # noqa: BLE001
            _LOGGER.warning(
                "dishwasher_card: legacy static API also failed (%s)", err2
            )

    # 2. inject the module into every frontend page
    try:
        extra = hass.data.get(frontend.DATA_EXTRA_MODULE_URL)
        if extra is not None:
            if hasattr(extra, "add"):
                extra.add(STATIC_URL)
            else:
                extra.append(STATIC_URL)
            _LOGGER.debug("dishwasher_card: injected at %s", STATIC_URL)
        else:
            _LOGGER.warning(
                "dishwasher_card: frontend extra-module store not available; "
                "the card will not be injected automatically"
            )
    except Exception as err:  # noqa: BLE001
        _LOGGER.warning("dishwasher_card: failed to inject module (%s)", err)

    return True
