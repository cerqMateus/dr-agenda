# Página de Pacientes - Dr. Agenda

## Funcionalidades Implementadas

### 📋 Página de Pacientes

- **Localização**: `/src/app/(protected)/patients/page.tsx`
- **Rota**: `/patients`
- Listagem de todos os pacientes da clínica
- Layout responsivo com cards de pacientes
- Integração com o sidebar existente

### ➕ Adicionar Paciente

- **Componente**: `AddPatientButton`
- **Localização**: `/src/app/(protected)/patients/components/add-patient-button.tsx`
- Botão que abre um dialog com formulário
- Ícone de "+" para fácil identificação

### 📝 Formulário de Paciente

- **Componente**: `UpsertPatientForm`
- **Localização**: `/src/app/(protected)/patients/components/upsert-patient-form.tsx`

#### Campos do Formulário:

- **Nome do paciente** - Campo obrigatório
- **Email** - Validação de formato de email
- **Número de telefone** - Máscara automática `(11) 99999-9999`
- **Sexo** - Select com opções "Masculino" e "Feminino"

#### Validações:

- Nome: obrigatório
- Email: formato válido obrigatório
- Telefone: 10-11 dígitos numéricos apenas
- Sexo: obrigatório

### 🗃️ Server Action

- **Localização**: `/src/actions/upsert-patient/`
- **Schema**: Validação com Zod
- **Função**: `upsertPatient` - Insere ou atualiza paciente
- Integração com a clínica do usuário logado
- Revalidação automática da página após operação

### 🃏 Card de Paciente

- **Componente**: `PatientCard`
- **Localização**: `/src/app/(protected)/patients/components/patient-card.tsx`
- Exibe informações do paciente com badges
- Avatar com iniciais do nome
- Botão "Ver detalhes" que abre o formulário de edição

#### Informações Exibidas:

- Nome e sexo no cabeçalho
- Email com ícone
- Telefone formatado com ícone
- Sexo com ícone

### 🔧 Tecnologias Utilizadas

- **Next.js 15** - Framework React
- **TypeScript** - Tipagem estática
- **Drizzle ORM** - ORM para banco de dados
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas
- **Tailwind CSS** - Estilização
- **Shadcn/ui** - Componentes de UI
- **React Number Format** - Formatação de números/telefone

### 📊 Banco de Dados

A tabela `patients` já existia no schema com os seguintes campos:

- `id` - UUID (chave primária)
- `clinicId` - UUID (referência à clínica)
- `name` - Texto
- `email` - Texto
- `phoneNumber` - Texto
- `sex` - Enum ('male', 'female')
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

### 🎯 Padrões Seguidos

- Mesma estrutura de pastas dos médicos
- Reutilização de componentes UI existentes
- Padrão de nomenclatura consistente
- Tratamento de erros padronizado
- Feedback visual com toasts
- Validação dupla (frontend + backend)

## Como Usar

1. Navegue para `/patients` na aplicação
2. Clique no botão "Adicionar paciente"
3. Preencha o formulário com os dados do paciente
4. Clique em "Adicionar paciente" para salvar
5. Para editar, clique em "Ver detalhes" em qualquer card de paciente
