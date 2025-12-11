import asyncio
import asyncpg
from passlib.context import CryptContext
import os
from dotenv import load_dotenv

load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

DATABASE_URL = f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"

async def update_passwords():
    conn = await asyncpg.connect(DATABASE_URL)
    
    try:
        print("Actualizando contraseñas de estudiantes...")
        students = await conn.fetch("SELECT id, password_hash FROM students WHERE password_hash IS NOT NULL")
        
        for student in students:
            # Si la contraseña NO empieza con $2b$ (bcrypt), hashearla
            if student['password_hash'] and not student['password_hash'].startswith('$2b$'):
                hashed = pwd_context.hash(student['password_hash'])
                await conn.execute(
                    "UPDATE students SET password_hash = $1 WHERE id = $2",
                    hashed, student['id']
                )
                print(f"✓ Student ID {student['id']} actualizado")
            else:
                print(f"⊘ Student ID {student['id']} ya está hasheado correctamente")
        
        print("\nActualizando contraseñas de usuarios (admins)...")
        users = await conn.fetch("SELECT id, password_hash FROM users")
        
        for user in users:
            if not user['password_hash'].startswith('$2b$'):
                hashed = pwd_context.hash(user['password_hash'])
                await conn.execute(
                    "UPDATE users SET password_hash = $1 WHERE id = $2",
                    hashed, user['id']
                )
                print(f"✓ User ID {user['id']} actualizado")
            else:
                print(f"⊘ User ID {user['id']} ya está hasheado correctamente")
        
        print("\n✅ Todas las contraseñas actualizadas correctamente!")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
    finally:
        await conn.close()

asyncio.run(update_passwords())