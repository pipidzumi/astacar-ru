-- Fix security warnings by setting search_path properly
CREATE OR REPLACE FUNCTION public.handle_auth_user_created()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert into users table with default role 'buyer'
    INSERT INTO public.users (id, email, phone, role, kyc_status)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'phone', null),
        'buyer',
        'pending'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.create_admin_user(admin_email TEXT)
RETURNS TEXT AS $$
DECLARE
    user_id UUID;
BEGIN
    -- Check if user exists in auth.users
    SELECT id INTO user_id FROM auth.users WHERE email = admin_email;
    
    if user_id IS NULL THEN
        RETURN 'Пользователь с email ' || admin_email || ' не найден в auth.users. Сначала зарегистрируйтесь.';
    END IF;
    
    -- Update user role to admin
    UPDATE public.users 
    SET role = 'admin' 
    WHERE id = user_id;
    
    IF NOT FOUND THEN
        RETURN 'Пользователь не найден в таблице users. Проверьте триггеры.';
    END IF;
    
    RETURN 'Пользователь ' || admin_email || ' получил роль администратора';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;