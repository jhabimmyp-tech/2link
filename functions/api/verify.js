export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const { token } = await request.json();

        // Extrae de forma segura la clave secreta desde las variables de entorno de Cloudflare
        const SECRET_KEY = env.TURNSTILE_SECRET_KEY;

        if (!SECRET_KEY) {
            return new Response(JSON.stringify({ success: false, error: "Error de configuración interna (Falta SECRET_KEY)" }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Estructuramos la petición hacia la API de validación de Turnstile
        const formData = new FormData();
        formData.append('secret', SECRET_KEY);
        formData.append('response', token);

        const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
        const result = await fetch(url, {
            body: formData,
            method: 'POST',
        });

        const outcome = await result.json();

        // Si la verificación es correcta, el backend provee el link restringido
        if (outcome.success) {
            return new Response(JSON.stringify({ 
                success: true, 
                url: "https://t.me/UnitedofBinners" 
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ success: false, error: "Verificación de Turnstile inválida" }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
