"""Config flow for the Dishwasher Card integration.

The integration itself needs no configuration; this flow exists so the
integration can be added via the Home Assistant UI.
"""

from __future__ import annotations

from typing import Any

from homeassistant.config_entries import ConfigFlow

from .const import DOMAIN


class DishwasherCardConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle the Dishwasher Card config flow."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> dict[str, Any]:
        """Handle a flow initiated by the user."""
        if user_input is not None:
            return self.async_create_entry(title="Dishwasher Card", data={})

        return self.async_show_form(step_id="user")
