PGDMP       0                 }            HCI    17.2    17.2 &               0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                           false                       0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                           false                       0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                           false                       1262    16912    HCI    DATABASE     ~   CREATE DATABASE "HCI" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'English_Philippines.1252';
    DROP DATABASE "HCI";
                     postgres    false                        2615    2200    public    SCHEMA        CREATE SCHEMA public;
    DROP SCHEMA public;
                     pg_database_owner    false                       0    0    SCHEMA public    COMMENT     6   COMMENT ON SCHEMA public IS 'standard public schema';
                        pg_database_owner    false    4            �            1259    16953    emergency_contacts    TABLE     �   CREATE TABLE public.emergency_contacts (
    contact_id integer NOT NULL,
    profile_id integer NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    phone_number character varying(15)
);
 &   DROP TABLE public.emergency_contacts;
       public         heap r       postgres    false    4            �            1259    16952 !   emergency_contacts_contact_id_seq    SEQUENCE     �   CREATE SEQUENCE public.emergency_contacts_contact_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 8   DROP SEQUENCE public.emergency_contacts_contact_id_seq;
       public               postgres    false    224    4                       0    0 !   emergency_contacts_contact_id_seq    SEQUENCE OWNED BY     g   ALTER SEQUENCE public.emergency_contacts_contact_id_seq OWNED BY public.emergency_contacts.contact_id;
          public               postgres    false    223            �            1259    16914    faces    TABLE     t   CREATE TABLE public.faces (
    face_id integer NOT NULL,
    face_descriptor bytea NOT NULL,
    file_path text
);
    DROP TABLE public.faces;
       public         heap r       postgres    false    4            �            1259    16913    faces_face_id_seq    SEQUENCE     �   CREATE SEQUENCE public.faces_face_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.faces_face_id_seq;
       public               postgres    false    218    4                       0    0    faces_face_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.faces_face_id_seq OWNED BY public.faces.face_id;
          public               postgres    false    217            �            1259    16941    parents    TABLE       CREATE TABLE public.parents (
    parent_id integer NOT NULL,
    profile_id integer NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    middle_name character varying(100),
    phone_number character varying(15)
);
    DROP TABLE public.parents;
       public         heap r       postgres    false    4            �            1259    16940    parents_parent_id_seq    SEQUENCE     �   CREATE SEQUENCE public.parents_parent_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public.parents_parent_id_seq;
       public               postgres    false    222    4                       0    0    parents_parent_id_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE public.parents_parent_id_seq OWNED BY public.parents.parent_id;
          public               postgres    false    221            �            1259    16923    profiles    TABLE     $  CREATE TABLE public.profiles (
    profile_id integer NOT NULL,
    face_id integer NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    middle_name character varying(100),
    age integer,
    birth_date date,
    gender character varying(10),
    nationality character varying(100),
    religion character varying(100),
    civil_status character varying(50),
    phone_number character varying(15),
    email character varying(100),
    present_address text,
    permanent_address text
);
    DROP TABLE public.profiles;
       public         heap r       postgres    false    4            �            1259    16922    profiles_profile_id_seq    SEQUENCE     �   CREATE SEQUENCE public.profiles_profile_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public.profiles_profile_id_seq;
       public               postgres    false    4    220                       0    0    profiles_profile_id_seq    SEQUENCE OWNED BY     S   ALTER SEQUENCE public.profiles_profile_id_seq OWNED BY public.profiles.profile_id;
          public               postgres    false    219            i           2604    16956    emergency_contacts contact_id    DEFAULT     �   ALTER TABLE ONLY public.emergency_contacts ALTER COLUMN contact_id SET DEFAULT nextval('public.emergency_contacts_contact_id_seq'::regclass);
 L   ALTER TABLE public.emergency_contacts ALTER COLUMN contact_id DROP DEFAULT;
       public               postgres    false    223    224    224            f           2604    16917    faces face_id    DEFAULT     n   ALTER TABLE ONLY public.faces ALTER COLUMN face_id SET DEFAULT nextval('public.faces_face_id_seq'::regclass);
 <   ALTER TABLE public.faces ALTER COLUMN face_id DROP DEFAULT;
       public               postgres    false    217    218    218            h           2604    16944    parents parent_id    DEFAULT     v   ALTER TABLE ONLY public.parents ALTER COLUMN parent_id SET DEFAULT nextval('public.parents_parent_id_seq'::regclass);
 @   ALTER TABLE public.parents ALTER COLUMN parent_id DROP DEFAULT;
       public               postgres    false    222    221    222            g           2604    16926    profiles profile_id    DEFAULT     z   ALTER TABLE ONLY public.profiles ALTER COLUMN profile_id SET DEFAULT nextval('public.profiles_profile_id_seq'::regclass);
 B   ALTER TABLE public.profiles ALTER COLUMN profile_id DROP DEFAULT;
       public               postgres    false    220    219    220                      0    16953    emergency_contacts 
   TABLE DATA           i   COPY public.emergency_contacts (contact_id, profile_id, first_name, last_name, phone_number) FROM stdin;
    public               postgres    false    224   .       	          0    16914    faces 
   TABLE DATA           D   COPY public.faces (face_id, face_descriptor, file_path) FROM stdin;
    public               postgres    false    218   #.                 0    16941    parents 
   TABLE DATA           j   COPY public.parents (parent_id, profile_id, first_name, last_name, middle_name, phone_number) FROM stdin;
    public               postgres    false    222   @.                 0    16923    profiles 
   TABLE DATA           �   COPY public.profiles (profile_id, face_id, first_name, last_name, middle_name, age, birth_date, gender, nationality, religion, civil_status, phone_number, email, present_address, permanent_address) FROM stdin;
    public               postgres    false    220   ].                  0    0 !   emergency_contacts_contact_id_seq    SEQUENCE SET     P   SELECT pg_catalog.setval('public.emergency_contacts_contact_id_seq', 30, true);
          public               postgres    false    223                       0    0    faces_face_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public.faces_face_id_seq', 83, true);
          public               postgres    false    217                       0    0    parents_parent_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public.parents_parent_id_seq', 30, true);
          public               postgres    false    221                       0    0    profiles_profile_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public.profiles_profile_id_seq', 31, true);
          public               postgres    false    219            s           2606    16958 *   emergency_contacts emergency_contacts_pkey 
   CONSTRAINT     p   ALTER TABLE ONLY public.emergency_contacts
    ADD CONSTRAINT emergency_contacts_pkey PRIMARY KEY (contact_id);
 T   ALTER TABLE ONLY public.emergency_contacts DROP CONSTRAINT emergency_contacts_pkey;
       public                 postgres    false    224            k           2606    16921    faces faces_pkey 
   CONSTRAINT     S   ALTER TABLE ONLY public.faces
    ADD CONSTRAINT faces_pkey PRIMARY KEY (face_id);
 :   ALTER TABLE ONLY public.faces DROP CONSTRAINT faces_pkey;
       public                 postgres    false    218            q           2606    16946    parents parents_pkey 
   CONSTRAINT     Y   ALTER TABLE ONLY public.parents
    ADD CONSTRAINT parents_pkey PRIMARY KEY (parent_id);
 >   ALTER TABLE ONLY public.parents DROP CONSTRAINT parents_pkey;
       public                 postgres    false    222            m           2606    16932    profiles profiles_face_id_key 
   CONSTRAINT     [   ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_face_id_key UNIQUE (face_id);
 G   ALTER TABLE ONLY public.profiles DROP CONSTRAINT profiles_face_id_key;
       public                 postgres    false    220            o           2606    16930    profiles profiles_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (profile_id);
 @   ALTER TABLE ONLY public.profiles DROP CONSTRAINT profiles_pkey;
       public                 postgres    false    220            t           2606    16935    profiles fk_face    FK CONSTRAINT     �   ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT fk_face FOREIGN KEY (face_id) REFERENCES public.faces(face_id) ON DELETE CASCADE;
 :   ALTER TABLE ONLY public.profiles DROP CONSTRAINT fk_face;
       public               postgres    false    220    4715    218            u           2606    16947    parents fk_profile    FK CONSTRAINT     �   ALTER TABLE ONLY public.parents
    ADD CONSTRAINT fk_profile FOREIGN KEY (profile_id) REFERENCES public.profiles(profile_id) ON DELETE CASCADE;
 <   ALTER TABLE ONLY public.parents DROP CONSTRAINT fk_profile;
       public               postgres    false    220    4719    222            v           2606    16959 %   emergency_contacts fk_profile_contact    FK CONSTRAINT     �   ALTER TABLE ONLY public.emergency_contacts
    ADD CONSTRAINT fk_profile_contact FOREIGN KEY (profile_id) REFERENCES public.profiles(profile_id) ON DELETE CASCADE;
 O   ALTER TABLE ONLY public.emergency_contacts DROP CONSTRAINT fk_profile_contact;
       public               postgres    false    4719    220    224                  x������ � �      	      x������ � �            x������ � �            x������ � �     